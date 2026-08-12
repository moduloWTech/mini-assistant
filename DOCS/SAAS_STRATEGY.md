# 🚀 Estratégia de Produto e Monetização SaaS (Add-ons e Ferramentas)

Este documento registra a estratégia comercial e arquitetural de como o nosso sistema "Multi-Agentes" é monetizado usando o modelo de **Tools sob Demanda (Add-ons)**, adaptado por Nicho.

---

## 💡 O Conceito Central

Nós não vendemos "robôs de chat". Nós vendemos **Funcionários Digitais com Habilidades (Braços)**.
O cliente adquire o cérebro base (Orquestrador + RAG) e "aluga" ferramentas extras que o robô pode usar para realizar ações no mundo real.

### Arquitetura de "Tags de Nicho"

Para não poluir o Dashboard do cliente e não confundi-lo com ferramentas inúteis para o seu setor, cada ferramenta (`Tool`) no sistema recebe uma **Tag de Nicho**.

Quando o cliente se cadastra, ele responde: **"Qual o seu negócio?"**
A partir dessa resposta, o Dashboard filtra as ferramentas.

| Nicho | Exemplos de Habilidades (Tools) Oferecidas no Dashboard |
| :--- | :--- |
| **🛍️ E-commerce** | `add_to_cart` (Carrinho), `check_inventory` (Estoque), `track_order` (Rastreio) |
| **🩺 Saúde / Clínicas** | `check_calendar` (Agenda), `book_appointment` (Marcação), `cancel_appointment` |
| **⚖️ Advocacia** | `check_lawsuit` (Consulta de Processo), `schedule_meeting` (Reunião) |
| **🏢 Imobiliária** | `search_property` (Filtro de Banco de Imóveis), `book_visit` (Agendar Visita) |
| **🌍 Global (Todos)** | `transfer_to_human` (Chamar Atendente), `capture_lead` (Salvar no CRM) |

---

## 💰 Modelo de Precificação (Upsell Constante)

O sistema foi arquitetado para impulsionar a receita recorrente (MRR) através de Up-sells dentro do próprio painel.

### 🥉 Plano Basic (Apenas Conversa)
- **O que inclui:** Orquestrador, Personalidade Customizada e RAG (vetores de PDFs/Textos do negócio).
- **Como atua:** O robô responde dúvidas perfeitamente, atua como FAQ e persuasão, mas **não executa ações** (não mexe em agendas nem carrinhos).

### 🥈 Plano Pro (Conversa + Ação)
- **O que inclui:** Tudo do Basic + Direito a ativar até **2 Tools (Braços)**.
- **Exemplo:** Uma clínica assina o PRO para liberar a ferramenta de `book_appointment` e `cancel_appointment`.

### 🛒 Marketplace de Add-ons (A la carte)
- Se o cliente já usou suas 2 Tools do plano Pro, mas quer adicionar a integração com o CRM (ex: Pipefy ou HubSpot) para que o robô crie cards de leads automaticamente, ele paga um valor adicional por mês (Ex: +R$ 50/mês) para habilitar esse "Braço" extra.

---

## ⚙️ Implementação no Backend (Dinâmica de Tools)

O funcionamento técnico dessa estratégia é elegante e extremamente seguro (zero alucinações).

1. No banco de dados, a tabela \`Client\` possui a coluna \`activeTools\` (Ex: \`["add_to_cart", "transfer_to_human"]\`).
2. Quando uma mensagem chega no Webhook, o nosso **Orquestrador** lê o perfil do cliente no DB.
3. O código envia para o Google Gemini **apenas** os Schemas JSON das ferramentas que aquele cliente comprou/ativou.
4. Consequentemente, a IA do E-commerce *nem sabe* que a função de "Agendar Consulta" existe, mantendo a conversa blindada ao nicho e aos limites do plano pago.

---

## 🦾 Catálogo de Ferramentas por Nicho (Brainstorming)

Para materializar o conceito de "dar braços aos agentes", aqui está o escopo prático do que cada ferramenta poderá fazer no mundo real para gerar valor absurdo aos assinantes do SaaS:

### 🛍️ 1. E-commerce e Vitrines (Ex: Moda, Varejo)
*   **Adicionar ao Carrinho Invisível (`add_to_cart`):** A cliente diz "Vou levar o vestido preto M". O agente não manda um link genérico, ele aciona uma função que insere o produto direto no carrinho da sessão web atual.
*   **Manipulação de Interface Visual (`highlight_ui`):** A cliente pede "Quero ver botas de couro". O agente aciona um comando para a tela rolar sozinha (scroll automático) e dar destaque/piscar as botas na página do usuário.
*   **Consulta de Estoque Real (`check_inventory`):** O agente consulta via API o ERP ou loja virtual em tempo real antes de confirmar a disponibilidade de um tamanho.
*   **Rastreio de Pedido (`track_order`):** O cliente digita o CPF, e o agente busca na API dos Correios ou transportadora onde está a caixa.

### 📅 2. Serviços (Clínicas, Salões, Consultorias)
*   **Leitura de Agenda Dinâmica (`read_calendar`):** O agente consulta o Google Calendar em tempo real. Em vez de dizer "Atendemos de 8h às 18h", ele diz: "Tenho um buraco na quinta às 14h ou sexta às 09h. Qual prefere?"
*   **Agendamento e Cancelamento (`manage_appointments`):** O cliente confirma, o agente cria o evento no calendário na hora, bloqueia a vaga e envia link do Meet (se online) ou endereço do consultório.

### 🏢 3. B2B, Vendas de Software e Agências (A MW Technology)
*   **Injeção de Leads no CRM (`create_lead`):** Durante a conversa o agente descobre a "dor" do cliente, coleta e-mail e telefone, e silenciosamente gera um Card no Trello, HubSpot ou Pipefy para a equipe de vendas.
*   **Gerador de Orçamentos e Propostas (`generate_quote`):** Baseado na complexidade citada no chat, o agente aciona um script que gera um Link ou PDF de proposta estruturada.

### 🏠 4. Imobiliárias
*   **Query Dinâmica de Banco de Imóveis (`search_properties`):** O cliente diz "AP 2 quartos no centro até 300 mil". O agente filtra o DB e devolve no chat web um carrossel com os 3 melhores imóveis que dão match com a necessidade.
*   **Match com Corretor (`transfer_to_broker`):** O agente checa qual humano está de plantão e faz a transferência avisando: "O corretor João vai assumir daqui para marcar sua visita."

---

## 🔒 Roadmap de Segurança: Validação Dinâmica de Domínios (Widget)
*Nota Arquitetural (v2.0):* O Endpoint `/channels/web` possui CORS aberto (`*`) intencionalmente. No futuro, para evitar que concorrentes do nosso cliente roubem o script do widget e consumam os tokens do Gemini de forma maliciosa:
1. Adicionaremos a coluna `allowedDomains` no schema do `Client`.
2. A interceptação de segurança não ocorrerá na camada de rede (CORS preflight, que sobrecarrega o DB), mas na camada de **Controller (Regra de Negócio)**.
3. Ao receber uma requisição, o código checará se o cabeçalho HTTP `Origin` dá match com o banco de dados. Caso contrário, devolve `403 Forbidden`.

---
*Este documento guiará a construção do Dashboard Frontend e a refatoração do nosso Orquestrador para suportar 'Dynamic Tool Calling'.*
