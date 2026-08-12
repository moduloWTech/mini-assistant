# 🖥️ Especificações do Projeto Frontend (SaaS Dashboard)

> **Aviso para Agentes de IA e Desenvolvedores:** Este documento contém o escopo técnico completo para a construção do **Painel Administrativo (Dashboard)** da plataforma Multi-Agentes. Leia atentamente a arquitetura do Backend para entender como o Frontend deve se comunicar com o sistema Core.

---

## 1. Visão Geral da Arquitetura

O sistema atual foi desenhado no formato **SaaS (Software as a Service) Multi-Tenant API-First**.
Isso significa que existe um repositório Backend (API) rodando em Node.js no Google Cloud, isolado, que processa toda a lógica de Inteligência Artificial.

**O novo projeto Frontend (O Dashboard)** será uma aplicação apartada (provavelmente Next.js ou Vite + React). A responsabilidade do Frontend é puramente visual: permitir que donos de empresas criem contas, configurem a personalidade de seus robôs e ativem integrações, consumindo as rotas REST/GraphQL da nossa API.

---

## 2. Como o Backend (Motor de IA) Funciona

Para codar o Frontend, você precisa entender o que o Backend espera:

1. **Multi-Tenant (Model `Client`):** O banco de dados (PostgreSQL + Prisma) gira em torno do `Client` (a empresa assinante). Cada cliente tem um `id` (UUID) que amarra as configurações do robô dele, os tokens de WhatsApp/Telegram, e o conhecimento vetorial.
2. **Cérebro Vetorial (RAG com `pgvector`):** O backend possui uma tabela de *Knowledge* com embeddings gerados pelo Google Gemini. Quando um usuário conversa com o robô no Telegram, o backend busca os pedaços de texto semanticamente parecidos nessa tabela para embasar a resposta da IA.
3. **Múltiplos Canais:** A API escuta webhooks (Telegram, WhatsApp e Web). As mensagens entram numa fila (Redis + BullMQ) e são processadas em background para evitar timeouts.
4. **Tools e Nichos:** O robô de cada cliente pode ter "Ferramentas" diferentes (ex: Adicionar ao Carrinho, Agendar Reunião). Isso é definido por um array de `activeTools` salvo no cadastro do Cliente.

---

## 3. Escopo de Funcionalidades do Dashboard (O que deve ser construído)

O Frontend deve contemplar as seguintes jornadas de usuário:

### 🔐 A. Autenticação e Onboarding
- **Login / Sign Up:** Tela moderna de cadastro.
- **Onboarding de Nicho:** Logo após o cadastro, perguntar: *"Qual o foco do seu negócio?"* (E-commerce, Clínica, Advocacia, Outros). O Frontend salva isso no perfil do cliente, pois isso ditará quais *Tools* aparecerão na loja de Add-ons.
- **Batismo do Robô:** Formulário inicial onde o cliente define o `nome` do seu agente, a `systemPersona` (ex: "Você é um vendedor persuasivo") e a empresa que ele representa.

### 🧠 B. Gestão de Conhecimento (Knowledge Base)
- **Upload de Materiais:** Uma interface onde o cliente cola os FAQs do seu site, regras de preço ou faz upload de arquivos `.txt`.
- O Frontend pegará esse texto e fará um `POST` para uma rota da API. A API se encarregará de vetorizar isso com o Gemini e salvar no `pgvector`.
- **Listagem de Conhecimento:** Uma tabela mostrando todos os "fatos" que o robô daquela empresa já sabe, com botão de excluir.

### 🔌 C. Hub de Integrações (Canais)
- **Telegram / WhatsApp:** Formulários simples para colar o `Bot Token` do Telegram ou as chaves do WhatsApp Business (que a API encriptará com AES-256-GCM antes de salvar no DB).
- **Gerador de Widget Web:** Uma tela que gera e exibe um "Código Snippet" (script) que o cliente pode copiar e colar no `<head>` do site dele para ter a bolha de chat flutuante no próprio site.

### 🛠️ D. Loja de Habilidades (Add-ons / Tools)
- Uma tela visual com "Cards" das habilidades disponíveis.
- O Frontend deve fazer fetch na API pelas ferramentas disponíveis **para o nicho do cliente** + ferramentas globais.
- O usuário ativa/desativa os cards no estilo *toggle switch*. (Isso atualiza a array `activeTools` no DB da API).

### 📊 E. Analytics e Inbox (Opcional para a V1)
- Uma listagem (tabela) dos usuários finais (`EndUsers`) que conversaram com o robô da empresa nas últimas 24h.
- Visualização do histórico do chat para o dono da empresa auditar se o robô atendeu bem.

---

## 4. Requisitos Técnicos Sugeridos para o Agente Desenvolvedor

- **Framework:** Next.js (App Router) ou Vite (React).
- **Estilização:** TailwindCSS + `shadcn/ui` (para componentes rápidos, limpos e acessíveis).
- **Gerenciamento de Estado de API:** `TanStack Query` (React Query) para lidar perfeitamente com caching, loadings e chamadas assíncronas ao Backend SaaS.
- **Ícones:** `lucide-react`.
- **Formulários:** `react-hook-form` + `zod` para validação antes de mandar pra API.

> **Objetivo Final:** O Dashboard deve ter cara de produto Premium (Enterprise). Abusar de glassmorphism leve, dark mode opcional, tipografia elegante e animações suaves (Framer Motion). Não crie um visual de "painel de TI anos 2000", crie um visual de **"Ferramenta de Marketing do Futuro"**.
