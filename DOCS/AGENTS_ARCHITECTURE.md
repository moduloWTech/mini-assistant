# 🧠 Arquitetura Definitiva de Agentes de IA (Multi-Tenant)

Este documento é o **Guia Mestre (Blueprint)** da arquitetura de inteligência artificial desenvolvida na MW Technology. Ele detalha como o sistema foi projetado para ser escalável, agnóstico e facilmente replicável para **qualquer nicho de mercado** (ex: Clínicas, E-commerces, Imobiliárias).

---

## 🏗️ 1. Pilares da Arquitetura

O sistema foi desenhado para resolver três grandes problemas de bots tradicionais: **Burrice (falta de contexto)**, **Lentidão (timeouts)** e **Rigidez (preso a um único canal)**.

1. **Omnichannel Agnostic (Desacoplado):** A inteligência (Core) não sabe se a mensagem veio do WhatsApp, Telegram ou Site. Ela apenas recebe texto e devolve texto. Os *Adapters* (Controllers) fazem a tradução.
2. **Filas Assíncronas (Queue-Driven):** Webhooks não processam IA. Eles apenas colocam a mensagem em uma fila no **Redis (BullMQ)** e respondem `200 OK` instantaneamente. Um *Worker* em background (background job) consome a fila e chama o LLM, garantindo que o app nunca trave.
3. **Memória de Longo Prazo:** Usamos o PostgreSQL para armazenar o histórico de mensagens por `EndUser`, garantindo que o bot lembre de conversas passadas.
4. **RAG (Retrieval-Augmented Generation) com HNSW:** O "cérebro" da empresa (FAQs, regras, produtos) fica armazenado como vetores no `pgvector`. Em cada mensagem, buscamos apenas o contexto relevante semanticamente.
5. **Multi-Agentes (Orquestrador + Especialistas):** Em vez de um *Prompt Gigante* que tenta fazer tudo (vender, dar suporte, jogar conversa fora), temos um **Orquestrador** que entende a intenção e delega para **Agentes Especialistas**.

---

## 🌊 2. O Fluxo da Mensagem (Message Flow)

Quando um cliente envia "Como faço para comprar?":

1. **Webhook / API:** O servidor recebe a requisição (Telegram/Zap/Web).
2. **Redis Queue:** A mensagem é jogada na fila `incoming-messages`.
3. **Worker:** Pega a mensagem e aciona o **Orquestrador**.
4. **Memória & RAG:** O Orquestrador busca as últimas 10 mensagens do usuário (PostgreSQL) e busca no banco vetorial (`pgvector`) as regras da empresa sobre "compras".
5. **Classificação de Intenção:** O Orquestrador (LLM rápido, ex: Gemini Flash) decide: *"Isso é uma intenção de VENDAS"*.
6. **Agente Especialista:** A mensagem, o histórico e o RAG são enviados para o `SalesAgent`. O Agente gera a resposta final (com técnicas de persuasão).
7. **Envio:** O Worker dispara a resposta de volta pelo canal correto (Telegram/Zap/Web).

---

## 👗 3. Guia de Replicação: Case "Vitrine de Moda Feminina"

Para usar esta mesma arquitetura para criar um **Agente de Vendas de Moda Feminina** (um personal stylist integrado ao site), siga este roteiro de adaptação:

### Passo A: Otimização do Banco de Dados (Schema)
No seu `schema.prisma`, além das tabelas de `Client`, `EndUser` e `Message`, você precisará expandir o Conhecimento Vetorial para Produtos:

- **Tabela `Product`:** Nome, Preço, Categoria, Imagem, Link, Estoque.
- **Tabela `ProductEmbedding` (pgvector):** A descrição de estilo do produto ("Vestido longo floral verão leve") convertida em vetor. Isso permite buscas semânticas (Ex: se a cliente pedir "Quero algo para um casamento na praia", o RAG trará vestidos florais longos).

### Passo B: Criação das Personas (Config)
O script de setup (`setup-client.ts`) injetará a personalidade do nicho.

- **System Persona:** *"Você é a Chloe, personal stylist da boutique. Seu tom é chique, empolgado e focado em tendências de moda. Você usa emojis como ✨👗💅."*
- **Sales Guidelines:** *"Nunca responda com links diretos sem antes fazer um elogio à escolha da cliente. Sugira sempre um acessório que combine (cross-sell)."*

### Passo C: Desenvolvendo os Agentes Específicos
Em vez de usar os agentes da MW Technology, você criará a pasta `src/agents/fashion/`:

1. **`StylistAgent` (Orquestrador de Estilo):**
   - *Função:* Entender o gosto da cliente. Identifica se ela quer ver catálogo, suporte sobre troca ou tirar dúvida de tamanho.
2. **`CatalogAgent` (Vendedor):**
   - *Função:* Pega o contexto do RAG (vetores de produtos). Se a cliente pediu vestidos pretos, o agente formula uma resposta elegante mostrando 3 opções do catálogo.
3. **`CheckoutAgent` (Fechamento):**
   - *Função:* Guiar o cliente a finalizar a compra na vitrine web, oferecendo um cupom de desconto se sentir hesitação no histórico de mensagens.

### Passo D: Interação com o Frontend (Comandos Secretos e Function Calling)
Para que o bot não seja apenas um "falador", mas um **operador do site**, você pode usar duas estratégias:

1. **Lightweight (Comandos Secretos via Texto):** Ensinar a IA a injetar tags no final da resposta (ex: `[REDIRECT:/diagnostico]`). O frontend intercepta via Regex, limpa a mensagem, e executa ações de UI (como redirecionar a página ou mostrar botões de confirmação). Esta é uma abordagem rápida e muito eficaz.
2. **Advanced (Function Calling):** Habilitar o *Function Calling* do Gemini, onde o agente tem acesso a "Ferramentas" (Tools) que ele pode acionar sozinho. Exemplo:
- `search_catalog(query, color, size)` -> Retorna JSON dos produtos.
- `add_to_cart(product_id)` -> Envia via WebSocket/API um comando para o navegador da cliente, **adicionando o vestido ao carrinho automaticamente** enquanto ela conversa.
- `highlight_product(product_id)` -> Dispara um evento no Frontend Web (React) que faz a tela rolar e piscar o produto que a IA está recomendando no momento.

**A verdadeira revolução do seu próximo projeto Web Chat:** O bot e a Interface Visual do site devem se comunicar. Quando a IA decidir "recomendar a coleção de inverno", o LLM retorna uma `ToolCall` e seu React renderiza os cards na tela do chat ou na vitrine lateral. Isso cria a "Experiência de Vendedor Perfeito".

---

## 🛠️ 4. Checklist Técnico de Replicação

Sempre que iniciar um novo projeto baseado neste Core, copie as seguintes pastas/arquivos fundamentais:

1. **`/src/orchestrator`**: O coração do sistema. O roteamento de intenção com LLM é 100% reaproveitável.
2. **`/src/DB`**: O arquivo `prisma.config.ts` e o arquivo `memory/ChatMemoryRepository.ts` são imutáveis. O jeito de salvar chat é o mesmo para todo nicho.
3. **`/src/queue`**: O `messageQueue.ts` (BullMQ + Redis) é obrigatório para não derrubar sua aplicação se a loja fizer uma promoção e 1.000 clientes mandarem mensagem ao mesmo tempo.
4. **`/src/utils/encryption.ts`**: Nunca abra mão da criptografia AES-256-GCM para as chaves de API dos seus clientes.

### O que você VAI mudar no novo projeto:
- A pasta `/src/agents/` (Os prompts e especialidades mudam de Tecnologia para Moda, Imobiliária, etc).
- O arquivo `setup-manual-client.ts` (Os prompts padrão injetados no banco mudam completamente).
- A adição de *Function Calling / Tools* no payload do Gemini para interagir dinamicamente com o sistema do cliente.

---
**Documento Vivo:** Atualize este guia sempre que implementar novos padrões arquiteturais (ex: Agentic Workflows mais complexos, uso de LangChain, novos provedores de embeddings).
