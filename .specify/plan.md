# 📐 Plano Técnico de Arquitetura: Mini-Assistant

## 1. Arquitetura de Componentes

```mermaid
graph TD
    ClientApp[WhatsApp / Telegram / Web Widget] -->|HTTP Webhook| Router[Express Router]
    Router -->|Enqueue Job| Queue[Redis + BullMQ Queue]
    Queue -->|Process Job| Worker[Background Message Worker]
    Worker -->|1. Classify & RAG Search| DB[(PostgreSQL + pgvector)]
    Worker -->|2. Generate Response| Gemini[Google Gemini 2.5 Flash]
    Worker -->|3. Send Message| ClientApp
```

---

## 2. Estrutura de Dados (Prisma Schema)
- `Client`: Entidade principal da empresa assinante.
- `KnowledgeChunk`: Tabela vetorial RAG com índice HNSW/pgvector.
- `EndUser` & `Message`: Histórico de conversas por canal e usuário.
- `Classification`: Cache vetorial de classificações prévias.

---

## 3. Estratégia de Implantação e CI/CD
- **Docker Compose**: Containerização unificada contendo API Node.js, Redis e PostgreSQL com suporte a `pgvector`.
- **GitHub Actions**: Build automático da imagem Docker publicada no GitHub Container Registry (GHCR).
