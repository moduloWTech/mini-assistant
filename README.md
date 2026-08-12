# 🌌 Mini-Assistant - Plataforma SaaS Multi-Agente

Bem-vindo ao repositório oficial do **Mini-Assistant**! Este é o motor (Backend) de uma plataforma **SaaS (Software as a Service) Enterprise** para criação de agentes de Inteligência Artificial ultra-personalizados.

> 💡 **Nota Importante:**
> A persona **Keiko** é a agente configurada especificamente para a **MW Technology** (empresa criadora do projeto) e está sendo utilizada como ambiente prático de testes em produção para validar recursos e identificar possíveis gargalos de experiência de uso antes de abrir a plataforma para vendas comerciais.

---

## 👁️ Visão de Produto (O que estamos construindo?)

O **Mini-Assistant** nasce com o propósito de escalar o atendimento inteligente. Em vez de ser um bot engessado, o sistema foi desenhado para ser **Multi-Tenant**. Isso significa que:

- 🏢 **Cada Cliente é Único:** Diferentes empresas podem assinar a plataforma. Cada uma terá o seu próprio bot (com nome, personalidade, e token de WhatsApp/Telegram independentes).
- 🧠 **Cérebros Isolados (RAG):** O conhecimento da "Empresa A" não se mistura com o da "Empresa B". Utilizamos bancos de dados vetoriais para dar contexto e embasamento real às falas do bot.
- 🎭 **Orquestração de Múltiplos Agentes:** O sistema não joga toda a conversa num prompt gigante. Um **Orquestrador** inteligente classifica a intenção do usuário e delega para o agente certo (Vendas, Smalltalk, História, Memória).

### 🎯 O Futuro do Frontend (Dashboard Administrativo)
A próxima grande fase do projeto é o Frontend (React/Next.js). O Dashboard não precisará se preocupar com a engenharia complexa de IA. Ele servirá para:
1. **Onboarding:** Formulários simples para o dono da empresa batizar a IA, definir a Missão e a "Tom de Voz".
2. **Knowledge Base:** Upload de PDFs ou textos para alimentar o cérebro vetorial daquela empresa específica.
3. **Métricas e Leads:** Visualização das conversas e contatos capturados pelos agentes.

---

> 📘 **Atenção Desenvolvedor:** Para entender o design pattern Multi-Agentes utilizado neste Core e replicar essa inteligência para outros nichos (ex: Moda, Imobiliária), leia o documento mestre: [Arquitetura Definitiva de Agentes de IA](DOCS/AGENTS_ARCHITECTURE.md). E para entender a visão de negócio e monetização de habilidades, leia: [Estratégia SaaS](DOCS/SAAS_STRATEGY.md). Se for iniciar o Frontend, leia: [Requisitos do Dashboard](DOCS/DASHBOARD_REQUIREMENTS.md).

---

## 🏗️ Visão Técnica & Arquitetura

Nossa infraestrutura foi desenhada para aguentar carga pesada (Alta Disponibilidade) e responder em milissegundos nos webhooks das redes sociais.

### 🧩 Pilares Tecnológicos
- **Linguagem & Framework:** Node.js, Express, TypeScript.
- **Inteligência Artificial:** Google Gemini 2.5 Flash via chamadas diretas (v1beta API).
- **Banco de Dados Relacional & Vetorial:** PostgreSQL + Prisma ORM + extensão `pgvector` (índices HNSW de 768 dimensões).
- **Filas Assíncronas:** Redis + BullMQ (Para devolver `200 OK` para o WhatsApp/Telegram instantaneamente, processando o LLM em background).
- **Segurança (Criptografia B2B):** Senhas e Tokens de redes sociais são armazenados usando criptografia simétrica `AES-256-GCM`.
- **Deploy Automático (CI/CD):** Imagens buildadas no GitHub Actions e publicadas no GHCR.

---

## 🔌 Guia de Integração para o Frontend

Quando formos conectar o Frontend a esta API, aqui estão os pontos focais:

### 1. Entidades Principais no Prisma
- `Client`: A empresa que assina o SaaS. Possui as configurações globais (`systemPersona`) e os tokens de integração.
- `CompanyData`: Os "pedaços de conhecimento" da empresa, armazenados em formato vetorial para a busca semântica (RAG).
- `*Config` (ex: `MemoryConfig`, `PricingConfig`): Tabelas de configuração granular de como cada agente específico deve se portar para aquele cliente.
- `EndUser` e `Message`: O histórico de conversa entre um usuário do WhatsApp/Telegram/Web e a IA.

### 2. Acesso à API Web (Widget)
A plataforma possui um canal genérico `/channels/web/message` que o frontend pode consumir diretamente para renderizar um chat interativo (Widget) no site da própria empresa cliente.

> 🌐 **Dica Prática:** Criamos um guia com um código React (`ChatWidget.tsx`) pronto para copiar e colar no seu site. Veja em: [Guia de Integração Web](DOCS/WEB_INTEGRATION.md).

---

## ⚙️ Configuração e Execução (Ambiente Dev)

Para rodar este monstro localmente e desenvolver novas features, siga o roteiro:

### 1. Pré-Requisitos
- **Node.js** (v20+)
- **Docker & Docker Compose** (Para rodar o Banco e o Redis)
- Chave de API do **Google Gemini**

### 2. Subindo a Infraestrutura Local
```bash
# Clone o repositório
git clone https://github.com/claudiojas/mini-assistant.git
cd mini-assistant

# Instale os pacotes
npm install

# Inicie o PostgreSQL e o Redis pelo Docker Compose
sudo docker compose up -d

# Crie as tabelas no banco de dados e gere os tipos do Prisma
npx prisma db push
npx prisma generate
```

### 3. Configurando as Variáveis (.env)
Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente (especialmente o `GEMINI_API_KEY` e a `ENCRYPTION_KEY`). A `REDIS_URL` padrão local é `redis://localhost:6379`.

### 4. Populando Dados de Teste (Seed)
Nós possuímos scripts robustos para simular uma empresa ("MW Technology") e testar o funcionamento sem precisar de um Frontend:

```bash
# 1. Cria a persona "Keiko" e as diretrizes dos agentes no Banco
npm run setup:client

# 2. Transforma textos da empresa em Vetores e salva no pgvector
npm run seed:knowledge
```

### 5. Iniciando o Servidor Node
```bash
npm run dev
```

---

## 🧪 Testes de Estresse e Simulação

A API conta com scripts de simulação de canais. Você pode rodar testes rigorosos pelo terminal sem precisar abrir o Postman:

- `npx tsx scripts/tests/test-channels.ts`: Dispara eventos falsos simulando webhooks do WebChat e Telegram.
- `npx tsx scripts/tests/test-memory.ts`: Avalia se o Agente de Memória consegue resgatar nomes e contextos de mensagens antigas.
- `npx tsx scripts/tests/e2e-test.ts`: Roda uma bateria completa de RAG.

---

## 🚀 CI/CD & Deploy na Produção

O build é gerenciado pelo **GitHub Actions** (Workflow de `docker-build.yml`). Sempre que um código vai para a branch `main`:
1. Uma máquina potente compila o Typescript.
2. Gera a imagem Docker otimizada (baseada em Alpine).
3. Publica de forma privada no **GHCR** (GitHub Container Registry).

Para implantar as novidades na Máquina Virtual (GCP), rodamos:
```bash
git pull origin main
sudo docker compose -f docker-compose.production.yml pull
sudo docker compose -f docker-compose.production.yml up -d
```

---
*Construído com obsessão por performance, RAG assíncrono e muito ☕.*