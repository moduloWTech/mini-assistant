# 🏛️ Constituição MW Technology - Diretrizes Oficiais (Spec-Driven Development)

## 1. Visão de Produto e Negócios (Regra Inegociável)
- **Plataforma Empresarial White-Label**: O Mini-Assistant **não é** um SaaS operado pela MW Technology focado no cliente final. Ele é uma plataforma de agentes de IA desenvolvida para ser **licenciada** e **implantada na infraestrutura do comprador/parceiro**.
- **Customer-Hosted (BYOI/BYOK)**: A arquitetura não deve pressupor dependência da MW Technology. O software deve aceitar infraestrutura providenciada pelo cliente (Bring Your Own Infrastructure) e chaves de APIs custeadas pelo cliente (Bring Your Own Key - Gemini, OpenAI, etc).
- **Agentes de Execução**: Abandonamos o modelo puramente "chatbot". Os agentes são entidades que executam tarefas (integrações com CRM, webhooks, agendamentos, etc). A plataforma suporta **múltiplos agentes** especializados por empresa.

---

## 2. Padrões de Arquitetura & Stack Tecnológica
- **Engenharia Sob Medida**: Desenvolvemos soluções 100% sob medida em Node.js, TypeScript e React/Next.js. Não utilizamos construtores visuais genéricos (como WordPress).
- **Backend Core**: Node.js (v20+), Fastify / Express 5, TypeScript.
- **Inteligência Artificial & LLM**: Google Gemini API nativo, porém com interface orquestradora que permita troca para outros LLMs compatíveis no futuro (BYOK).
- **Banco de Dados Relacional & Vetorial**: PostgreSQL com extensão `pgvector` gerenciado via **Prisma ORM**.
- **Processamento Assíncrono & Filas**: Redis + **BullMQ**. Webhooks (WhatsApp Meta, Telegram, Web) **nunca** executam chamadas pesadas sincronicamente. Eles devem enfileirar a tarefa e retornar HTTP 200 instantaneamente.

---

## 3. Diretrizes de Qualidade de Código & Segurança
- **Segurança B2B & Criptografia (Mandatório)**: Chaves de API, segredos e tokens de clientes **NUNCA** devem ser hardcoded. Devem ser salvos no banco de dados e criptografados obrigatoriamente usando `AES-256-GCM` com a chave mestre do `.env`.
- **Tratamento Estrito de Exceções**: Proibido `try/catch` silencioso ou engolir erros técnicos (como quedas da API do Gemini ou DB). As exceções devem ser capturadas e possuir fallbacks.
- **Abordagem SDD**: O diretório `.specify/` e os documentos na pasta `DOCS/` governam as regras de arquitetura. Toda IA deve validar o design contra o *Documento Mestre do Produto* antes de codificar.


