# 🌌 Mini-Assistant Enterprise - Plataforma SaaS Multi-Agente (White-Label)

Bem-vindo ao repositório oficial do **Mini-Assistant Enterprise**! Esta é uma plataforma **Turnkey / Standalone 100% autônoma** de Inteligência Artificial Multi-Agente com busca vetorial (RAG), canais omnichannel (WhatsApp, Telegram, Web) e Painel Administrativo moderno.

---

## 💡 Visão de Produto & Diferenciais Comerciais

O **Mini-Assistant** foi arquitetado para ser entregue como um **produto completo e independente (Self-Contained)** para qualquer empresa que queira iniciar no mercado de agentes de IA:

- 🏢 **Multi-Tenant Nativo:** Cada empresa possui seu cérebro, persona, contatos e configurações isoladas.
- 🐳 **100% Autônomo (Zero Dependência Cloud para Testes):** O sistema roda localmente com PostgreSQL (`pgvector`) e Redis em contêineres Docker, permitindo testes completos e demonstrações sem custos de infraestrutura de terceiros.
- 🖥️ **Painel Administrativo Completo:** Interface visual moderna em Dark Mode (`/dashboard`) para gestão de personas, upload de documentos, live chat e CRM de leads.
- ⚡ **Cache Semântico & Fast-Path:** Redução drástica de custos de LLM respondendo perguntas recorrentes em milissegundos com similaridade vetorial de cosseno.
- 🛡️ **Resiliência Multi-LLM:** Circuit-breaker com fallback automático (Google Gemini 2.5 Flash ➔ OpenAI GPT-4o-mini).

---

## 🚀 Inicialização Rápida (Turnkey em 3 Passos)

### 1. Pré-Requisitos
* **Node.js** (v20+)
* **Docker & Docker Compose**

### 2. Executando o Deploy Automático
Na pasta raiz do projeto, execute o script de provisionamento:
```bash
./deploy.sh
```

Ou execute manualmente passo a passo:
```bash
# 1. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 2. Suba o banco de dados (PostgreSQL com pgvector) e o Redis no Docker
docker compose up -d

# 3. Instale as dependências e sincronize as tabelas
npm install
npx prisma generate
npx prisma db push

# 4. Popule o usuário administrador inicial
npx tsx scripts/seed-admin.ts

# 5. Inicie o servidor
npm run dev
```

---

## 🌐 Acessos e Endpoints

Após iniciar o servidor (`npm run dev`), acesse:

| Recurso | URL | Descrição |
| :--- | :--- | :--- |
| 🖥️ **Painel Administrativo** | `http://localhost:3000/dashboard` | Login: `admin@mwtechnology.com.br` / Senha: `123456` |
| 📚 **Swagger OpenAPI Docs** | `http://localhost:3000/api-docs` | Documentação interativa de todos os endpoints REST |
| 💬 **Widget Web Embeddable** | `http://localhost:3000/widget.js` | Script para inclusão em qualquer site HTML |

---

## 🏛️ Estrutura Arquitetural

```
mini-assistant/
├── dashboard/               # Frontend SPA Administrativo (HTML5, TailwindCSS, Lucide Icons)
├── prisma/                  # Schema do Banco de Dados Relacional e Vetorial (pgvector)
├── src/
│   ├── agentns/             # Agentes Especialistas (History, Pricing, Services, Contact, etc.)
│   ├── channels/            # Adaptadores Omnichannel (WhatsApp, Telegram, Web)
│   ├── docs/                # Configuração OpenAPI 3.0 / Swagger UI
│   ├── middlewares/         # Autenticação JWT, Rate Limiting e Validador de Domínio
│   ├── orchestrator/        # Orquestrador Central com Roteamento de Intenção e Fast-Path
│   ├── queue/               # Fila Assíncrona com BullMQ + Redis (processamento de webhooks)
│   ├── repository/          # Camada de Repositório (Busca Vetorial de Cosseno e Chat Memory)
│   ├── router/              # Rotas REST (/auth, /knowledge, /leads, /inbox, /billing, /analytics)
│   ├── services/            # Gateway Multi-LLM, Parsers de PDF/TXT e Web Scraper
│   └── tools/               # Dynamic Function Calling (Google Calendar, CRM Leads)
├── deploy.sh                # Script Turnkey de Inicialização Rápida
├── docker-compose.yml       # Orquestração local autônoma (PostgreSQL 17 pgvector + Redis)
└── TODO.md                  # Checklist Mestre de Engenharia e Produto
```

---

## 📘 Documentação Adicional

* [Manual de Entrega White-Label](DOCS/WHITE_LABEL_HANDBOOK.md)
* [Arquitetura Definitiva de Agentes](DOCS/AGENTS_ARCHITECTURE.md)
* [Estratégia de Monetização SaaS](DOCS/SAAS_STRATEGY.md)

---
*Desenvolvido para Alta Disponibilidade, Escala Comercial e Máxima Eficiência.*