# 📋 Lista de Tarefas (Tasks): Mini-Assistant

- [x] **Fase 1: Configuração do Core & Multi-Agente**
  - [x] Implementação do Orquestrador Central (`orchestrator.ts`)
  - [x] Criação dos Agentes Especialistas (`history`, `services`, `pricing`, `contacts`, `memory`, `smalltalk`)
  - [x] Integração com Google Gemini 2.5 Flash

- [x] **Fase 2: Motor RAG & PGVector**
  - [x] Modelagem das entidades no Prisma (`KnowledgeChunk` com `vector`)
  - [x] Scripts de ingestão e embeddings (`seed-knowledge.ts`, `embeddingService.ts`)
  - [x] Cache vetorial de classificações (`cachedClassifications.ts`)

- [x] **Fase 3: Mensageria & Multicanal**
  - [x] Fila de mensagens em background via Redis + BullMQ (`messageQueue.ts`)
  - [x] Roteadores de Webhook (WhatsApp, Telegram, Web Chat Widget)

- [x] **Fase 4: Integração de Ferramentas & Padrões SDD (Spec Kit)**
  - [x] Configuração MCP em `.agents/mcp_config.json` (Supabase + Notion)
  - [x] Estrutura Spec Kit (.specify/ com `constitution.md`, `spec.md`, `plan.md`, `tasks.md`)

- [ ] **Fase 5: Frontend Dashboard & Gestão de Leads (Próxima Etapa)**
  - [ ] Interface de Onboarding em Next.js para cadastro de empresas e personas
  - [ ] Upload visual de arquivos (PDF/TXT) para RAG
  - [ ] Dashboard de conversas e métricas
