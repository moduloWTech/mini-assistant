# Memória do Projeto - Mini Assistant (SaaS)

Este documento serve como a **Memória de Longo Prazo** para o assistente de desenvolvimento (IA), garantindo que o contexto do projeto, decisões arquiteturais e gargalos pendentes não sejam perdidos entre as sessões.

## 📅 Estado Atual (Deploy GCP, Multi-Tenant & Segurança)

### 1. Arquitetura do Sistema e Infraestrutura
O Mini Assistant é um sistema SaaS Multi-tenant construído em Node.js com Prisma e PostgreSQL, focado atualmente na integração do Telegram (com suporte dormente/arquitetural ao WhatsApp) e Chat Web.

- **Infraestrutura Cloud (GCP & Supabase)**: Hospedagem da API na VM dedicada do Google Cloud Platform (projeto `mw-technology-saas`, IP Estático `136.113.84.206` via Cloudflare `api.moduloweb.com.br`). O banco de dados foi migrado de um contêiner local para uma instância de nuvem gerenciada do **Supabase PostgreSQL** com suporte a `pgvector` ativo.
- **Deploy Containerizado Otimizado (Docker)**: O arquivo de produção `docker-compose.production.yml` foi otimizado para rodar apenas os contêineres da **API** (imagem GHCR) e do **Redis** local (para mensageria/filas BullMQ). O contêiner de banco local `pgvector:pg17` foi desativado e removido, poupando CPU e RAM do servidor e2-micro.
- **Banco de Dados Relacional e Vetorial**: Schema Prisma aponta para o banco remoto no Supabase. O banco foi estruturado para múltiplos clientes (`Client`) utilizando `pgvector` com embeddings de 768 dimensões gerados via `gemini-embedding-2` (HNSW).
- **Segurança de Dados**: Algoritmo simétrico `AES-256-GCM` com `ENCRYPTION_KEY` injetada via variáveis de ambiente (`.env.production`) para proteger tokens críticos (`telegramBotToken`, `whatsappAccessToken`). Sem essa chave, os scripts de setup (ex: `setup-manual-client.ts`) e o sistema abortam a execução.

### 2. O que foi feito recentemente
- **Migração de Banco de Dados e Ingestão**: Migração completa dos dados locais para o Supabase PostgreSQL. População semântica da tabela `Classification` com cerca de 1.180 variações e RAG na tabela `KnowledgeChunk`.
- **Limpeza de Recursos na VM**: Reconfiguração do `docker-compose.production.yml` removendo o serviço `pg` e o volume associado, liberando 571 MB de espaço e aliviando consideravelmente o uso de RAM.
- **Correção de ID no Widget Frontend**: Correção da variável `VITE_KEIKO_CLIENT_ID` no arquivo `.env` do projeto `moduloWeb_page`, direcionando as chamadas da Home Page ao novo ID real do Supabase (`304c20a4-8c3d-4f84-9ecf-82fd20f65a1e`), corrigindo o erro de smalltalk não configurada.
- **Validação de Produção**: Execução de testes de segurança, isolamento dinâmico (João vs Maria), rejeição de off-topic, proteção contra jailbreak e fallback para LLM Gemini em caso de falha de cache diretamente na base do Supabase com 100% de aprovação.
- **Criação do Escopo Multi-Agentes (Blueprint)**: Documentação profunda (`AGENTS_ARCHITECTURE.md`) detalhando como isolar ferramentas por nicho de mercado (Moda, Imobiliárias, Clínicas).
- **Estratégia SaaS (Business & Security)**: Modelagem do negócio (`SAAS_STRATEGY.md`) baseada na venda de "Braços" (Tools dinâmicas no Gemini via Function Calling) e projeto para validação de segurança de domínios via cabeçalho `Origin` direto na Regra de Negócio.
- **Separação do Frontend (Clean Architecture)**: Decisão arquitetural de construir o Dashboard em um repositório isolado (Next.js/React hospedado na Vercel). Para isso, foi elaborado o documento mestre `DASHBOARD_REQUIREMENTS.md` que guiará a IA desenvolvedora do Frontend.
- **Resolução de Gargalos da API (Gemini & Prisma)**: Investigação e correção de erros em cascata que engatilhavam respostas de fallback genéricas. O modelo principal foi migrado para `gemini-flash-latest` (mitigando erros 503 de sobrecarga na camada Free Tier). Problemas locais de banco de dados (`P2003 Foreign key constraint`) causados por resets de contêineres foram documentados e o fallback nativo do sistema foi aprimorado para ser mais profissional ("Estou com problemas no servidor...") em caso de downtime.

### 3. Próximos Passos (Gargalos Críticos Identificados)
Com o motor (Backend) rodando liso e a documentação SaaS de altíssimo nível pronta, a jornada agora se divide em duas frentes práticas:

1. **Construção do Dashboard Frontend (Painel do Cliente):**
   - *Desafio:* Clientes reais não usarão o terminal SSH. Precisamos da interface administrativa baseada no `DASHBOARD_REQUIREMENTS.md`.
   - *Ação:* Iniciar o novo repositório isolado em Next.js para cuidar das telas de Auth, Onboarding (Seleção de Nicho), Knowledge Base e Loja de Add-ons.

2. **Desenvolvimento do "Tool Calling" no Backend:**
   - *Desafio:* A Keiko atual é extremamente inteligente no RAG, mas não realiza ações de fato (ainda não tem "braços").
   - *Ação:* Desenvolver a camada de `Dynamic Tool Calling` no Orquestrador (`orchestrator.ts`), injetando os *schemas JSON* das ferramentas baseadas nas tags do nicho escolhido pelo cliente (Ex: integrar APIs de Carrinho ou de Agenda).

---
*Nota para a IA: Sempre leia este arquivo e todos os outros na pasta DOCS/ ao iniciar uma nova sessão para recuperar o contexto do que estamos construindo e as decisões arquiteturais.*
