# 🤖 Especificação do Produto: Mini-Assistant SaaS Platform

## 1. Objetivo do Produto
O **Mini-Assistant** é uma plataforma SaaS Multi-Tenant projetada para automatizar o atendimento ao cliente via Inteligência Artificial generativa ultra-personalizada, combinando orquestração multi-agente, busca semântica em base de conhecimento (RAG) e processamento assíncrono multicanal.

---

## 2. Requisitos Funcionais

### RF-01: Isolamento Multi-Tenant
- Cada cliente (`Client`) possui registro próprio, persona customizável (`systemPersona`), tokens de redes sociais criptografados e base vetorial isolada por `clientId`.

### RF-02: Orquestração Multi-Agente
- Classificação automática de intenção pelo `classifyService` nas seguintes categorias:
  - `history`: História e reputação da empresa.
  - `services`: Produtos e serviços prestados.
  - `pricing`: Tabelas de preço e orçamentos.
  - `contacts`: Canais de contato, horários e localização.
  - `memory`: Resgate de contexto e preferências do usuário.
  - `smalltalk`: Conversa casual e saudações.

### RF-03: RAG (Retrieval-Augmented Generation) com PGVector
- Fragmentos de conhecimento em `KnowledgeChunk` armazenados com vetores de 768 dimensões.
- Busca por similaridade cosseno no PostgreSQL para contextualizar o prompt do Gemini antes de gerar a resposta.

### RF-04: Processamento Assíncrono Multicanal
- Webhooks de entrada (WhatsApp, Telegram, Web) enfileiram mensagens no **BullMQ/Redis**.
- Trabalhadores em segundo plano processam o RAG + Gemini e enviam a resposta de volta ao canal correspondente.

---

## 3. Requisitos Não-Funcionais

- **Tempo de Resposta**: Webhooks de redes sociais devem responder HTTP 200 em menos de 500ms.
- **Segurança**: Criptografia AES-256-GCM para todos os segredos no banco.
- **Resiliência**: Fallbacks gracioso em caso de esgotamento de quota da API do Gemini (Erro 429) ou indisponibilidade temporária (Erro 503).
