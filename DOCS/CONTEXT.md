# Contexto e Estado Atual do Projeto: Mini Assistant (SaaS IA)

## 1. Visão Geral do Projeto
O **Mini Assistant** evoluiu de um simples orquestrador para uma plataforma SaaS (Software as a Service) de alto nível. O objetivo é permitir que empresas automatizem o atendimento via WhatsApp com uma IA que não apenas responde, mas possui a **personalidade** e o **conhecimento factual** (RAG) da marca.

## 2. Arquitetura de Última Geração

### 2.1. Multi-Tenancy Dinâmico
- **Isolamento de Dados**: Cada cliente (tenant) possui seu próprio conjunto de configurações e base de conhecimento.
- **Sistema de Personas**: Introduzimos o campo `systemPersona` no modelo `Client`. Isso permite que a "alma" da IA (Nome, Tom de Voz, Regras de Ouro) seja configurada dinamicamente no banco de dados.
- **WhatsApp Cloud API**: Integração dinâmica onde o roteamento de mensagens é feito via `phone_number_id`, permitindo que o sistema gerencie centenas de números de clientes diferentes simultaneamente.

### 2.2. Inteligência Artificial e RAG
- **Motor**: Utiliza **Google Gemini 2.5 Flash** via API direta (v1beta) para máxima estabilidade e suporte a recursos experimentais.
- **Busca Semântica (RAG)**: Implementado com **PostgreSQL + pgvector**. O sistema não "alucina" sobre a empresa; ele busca fatos reais em uma biblioteca vetorial antes de responder.
- **Orquestração de Agentes**: O sistema categoriza a intenção do usuário e ativa agentes especialistas (História, Preços, Serviços, Contato, etc.), injetando a Persona Global + Instruções Específicas + Contexto Recuperado.

## 3. Componentes Técnicos Chave

### 3.1. `callGeminiAgent.ts` e Infra de Fila (BullMQ)
- **O Motor**: Configurado para usar `systemInstruction` via chamadas diretas com `axios` suportando modelos experimentais (v1beta).
- **A Fila**: As integrações com WhatsApp e Telegram não rodam o Orquestrador diretamente de forma síncrona. As rotas HTTP salvam a requisição no Redis via **BullMQ** e devolvem Status 200 na hora, prevenindo *Timeouts* e quedas de serviço na Meta/Telegram.

### 3.2. `setup-manual-client.ts` & `seed-knowledge.ts`
- Scripts utilitários que provisionam empresas (SaaS) rapidamente, criptografando os tokens nativamente via AES-256-GCM.
- O `seed:knowledge` utiliza o modelo `gemini-embedding-2` configurado estritamente para `outputDimensionality: 768`, adaptando perfeitamente o texto para o `pgvector` HNSW.

### 3.3. Banco de Dados (Prisma Schema)
- **Client**: Armazena credenciais e a Persona Mestra.
- **KnowledgeChunk**: Armazena o conhecimento vetorial.
- **AgentConfigs**: Armazena as diretrizes funcionais de cada "cargo" (Agente).

## 4. Estado da Implementação (Maio 2026)

### ✅ Concluído (Fase Infra, Segurança e Escala)
- Arquitetura SaaS Multi-tenant totalmente funcional com suporte dinâmico a Webhooks.
- Sistema RAG integrado usando `pgvector` HNSW + `gemini-embedding-2` (768d).
- Sistema de Fila Assíncrona via `BullMQ` e `Redis` para blinder os Webhooks de *timeouts*.
- Criptografia simétrica robusta (`AES-256-GCM`) aplicada às chaves de acesso externas.
- Suíte robusta de testes sob a pasta `scripts/tests/` (E2E, Memória, Exaustão e Canais).

### 🚀 Próximos Passos
1. **Frontend Administrative**: Criar o dashboard web para os clientes gerenciarem suas próprias personas, faturamentos, knowledge bases, injetando os dados diretamente nas rotas HTTP em vez do `.env`.
2. **Dashboard de Leads**: Interface Front-end para visualizar as conversas, transcrições e métricas de leads qualificados pela IA.

## 5. Notas de Segurança e Estabilidade
- O modelo **`gemini-2.5-flash-native-audio-latest`** (ou a versão flash estável) foi homologado como o padrão para este projeto devido à sua baixa latência e alta taxa de compreensão de instruções complexas de sistema.
