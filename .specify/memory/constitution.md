# 🏛️ Constituição MW Technology - Padrões & Diretrizes SDD (Spec-Driven Development)

## 1. Princípios Fundamentais & Visão
- **Engenharia Sob Medida**: Desenvolvemos soluções 100% sob medida em Node.js, TypeScript e React/Next.js. Não utilizamos construtores visuais genéricos (como WordPress).
- **Abordagem SDD (Specification-Driven Development)**: A especificação mantida no diretório `.specify/` é o artefato vivo e a fonte da verdade para arquitetura, testes e código. A IA e os desenvolvedores leem as especificações antes de executar alterações.
- **Proatividade & Comunicação em PT-BR**: Toda a documentação e interações do agente devem ser em Português do Brasil de forma clara, profissional e orientada a resultados.

---

## 2. Padrões de Arquitetura & Stack Tecnológica
- **Backend Core**: Node.js (v20+), Express 5, TypeScript.
- **Inteligência Artificial & LLM**: Google Gemini API (modelos Gemini 2.5 Flash / Embeddings 768 dimensões).
- **Banco de Dados Relacional & Vetorial**: PostgreSQL com extensão `pgvector` gerenciado via **Prisma ORM**.
- **Processamento Assíncrono & Filas**: Redis + **BullMQ**. Webhooks (WhatsApp Meta, Telegram, Web) **nunca** executam LLM sincronicamente; eles enfileiram a tarefa e retornam HTTP 200 instantaneamente.
- **Segurança B2B & Criptografia**: Chaves de API e tokens de clientes são criptografados obrigatoriamente no banco usando `AES-256-GCM`.

---

## 3. Diretrizes de Qualidade de Código & Segurança
- **Tratamento Estrito de Exceções**: Proibido `try/catch` silencioso ou engolir erros técnicos. Exceções devem ser capturadas, registradas e tratadas com sistemas de fallback amigáveis ao usuário final.
- **Sem Modificações de Contrato Sem Refatoração**: Qualquer alteração em assinaturas de funções ou tabelas do Prisma deve atualizar todos os pontos de invocação.
- **Testes & Validação**: Não declarar conclusão de funcionalidade sem executar compilação (`npm run build`) e bateria de testes (`npx tsx scripts/tests/...`).

---

## 4. Persona Keiko & Regras de Atendimento MW
- A persona **Keiko** é a atendente virtual e especialista comercial da MW Technology.
- Tom de voz profissional, resolutivo e seguro, traduzindo termos técnicos em valor prático para o cliente.
- Sempre direciona clientes prontos para fechamento aos canais oficiais:
  - **Site**: `moduloweb.com.br`
  - **WhatsApp Comercial**: `+55 98 9 8506-6966`
  - **Instagram**: `@modulo_web_`
