# Relatório de Progresso e Guia Técnico: Mini Assistant

Este documento centraliza as informações técnicas, comandos essenciais e o estado atual de desenvolvimento do sistema **Mini Assistant**.

## 1. Visão Geral da Arquitetura (Plataforma Multi-Canal)
O sistema evoluiu para uma arquitetura modular que separa a inteligência (Orquestrador) da camada de transporte (Canais).

- **Arquitetura Multi-Canal**: Suporte simultâneo a WhatsApp, Telegram e Web Chat.
- **Orquestrador Central**: Inteligência agnóstica que processa mensagens e devolve a categoria e resposta.
- **SaaS de Elite**: Cada cliente possui seus próprios tokens de WhatsApp, Telegram e Personas isoladas no banco.
- **RAG & IA**: Busca vetorial (pgvector) + Gemini 2.5 Flash via API direta (v1beta).

## 2. Comandos de Setup e Automação

### 2.1. Provisionamento de Cliente (SaaS)
```bash
# 1. Configurar o cliente, Persona e Tokens (WhatsApp/Telegram)
npm run setup:client

# 2. Alimentar o conhecimento da empresa (RAG)
npm run seed:knowledge

# 3. Testar a IA no terminal
npx tsx scripts/test-channels.ts
```

### 2.2. Banco de Dados e Infra
- **Sincronizar Schema**: `npx prisma db push`
- **Gerar Client**: `npx prisma generate`

## 3. Estado Atual do Projeto

### 3.1. Arquitetura Multi-Canal (Concluído ✅)
- **Modularização**: Criada a pasta `src/channels/` para isolar as lógicas de entrada/saída.
- **Web Chat**: Implementado canal de API REST para integração direta com sites (`/channels/web/message`).
- **Telegram**: Implementado suporte dinâmico via `telegraf` e Webhooks seguros com `:verifyToken` na URL.
- **WhatsApp**: Refatorado para residir na nova camada de canais.

### 3.2. Evolução do Banco de Dados (Concluído ✅)
- **Multi-Bot**: Adicionados campos `telegramBotToken` e `telegramVerifyToken` ao modelo `Client`.
- **Inteligência Estendida**: Orquestrador agora retorna `message` e `category` (classificação), permitindo respostas mais ricas no frontend.

### 3.3. Implantação em Produção GCP (Concluído ✅)
- **Containerização**: API Node.js, banco `pgvector` e Fila `redis:alpine` orquestrados via `docker-compose.production.yml` para GCP (e2-micro).
- **Dimensões do Gemini**: A coluna de embeddings no banco utiliza `vector(768)` no `pgvector`, com índice HNSW. A aplicação agora utiliza o modelo `gemini-embedding-2` forçando o parâmetro `outputDimensionality: 768` para compatibilidade estrita.
- **Ambiente e Banco de Dados**: A injeção de variáveis via `.env.production` para o banco de produção e integração com a rede Docker para comunicação entre API, PostgreSQL e Redis.
- **Segurança e Rede**: Domínio roteado via Cloudflare (Proxy) com regras de liberação de tráfego HTTP configuradas no Firewall do Compute Engine. O Webhook final do Telegram foi atrelado com sucesso ao domínio HTTPS de produção.

### 3.4. Memória de Longo Prazo e Segurança B2B (Concluído ✅)
- **Persistência em DB**: Criadas as tabelas `EndUser` e `Message` para gerenciar histórico de conversas a longo prazo sem dependência de cache em memória (RAM), utilizando `ChatMemoryRepository`.
- **Vetorização HNSW**: Otimizado o RAG para grande escala com um índice HNSW `pgvector`. O modelo foi migrado para `gemini-embedding-2` (768 dimensões) para máxima precisão e performance, substituindo o depreciado `text-embedding-004`.
- **Criptografia**: Implementada a criptografia simétrica AES-256-GCM. Tokens confidenciais (`telegramBotToken`, `whatsappAccessToken`) agora são criptografados no banco (com fallback nativo para tokens legados em plain-text).

### 3.5. Correções de Orquestração (Concluído ✅)
- **Memory Agent**: Corrigida a inicialização de configurações de memória no setup do cliente (`MemoryConfig`) para garantir que o Agente de Memória não trave por ausência de dados, e removidas variáveis ociosas.

### 3.6. Migração para o Supabase e Otimização de Recursos da VM (Concluído ✅)
- **Banco de Dados Gerenciado**: Migramos a infraestrutura de dados para o **Supabase PostgreSQL** na nuvem, garantindo alta disponibilidade, backups automáticos e maior facilidade para escalonamento.
- **Limpeza e Economia de RAM na VM**: Atualizamos a configuração do `docker-compose.production.yml` para remover o contêiner do banco de dados local (`pgvector:pg17`), o volume persistente associado e limpar as imagens obsoletas do Docker. Isso liberou 571 MB de armazenamento e reduziu significativamente o consumo de memória RAM do servidor GCP (e2-micro).
- **Alimentação Semântica**: Ingerimos aproximadamente 1.180 variações de saudações e respostas na tabela `Classification` (cache semântico Cosseno < 0.20) e as diretrizes principais na tabela `KnowledgeChunk` (RAG).
- **Validação de Robustez**: A integração foi amplamente testada diretamente no banco de dados Supabase com 100% de sucesso nos testes de isolamento dinâmico de sessão, bloqueio off-topic (receita de bolo de chocolate), blindagem contra jailbreaks e fallback para LLM em cache misses.
- **Sincronização de Frontend**: Corrigimos o arquivo de variáveis de ambiente `.env` do projeto `moduloWeb_page` com o ID real do cliente associado no Supabase, restabelecendo o chat widget da página inicial com perfeição.

## 4. Roadmap de Evolução (Próximas Fases)

### 4.1. Alta Disponibilidade e Escala SaaS (Concluído ✅)
1. **Fila de Mensagens Assíncrona**: Substituímos os processos bloqueantes dos Webhooks pelo `BullMQ` + `Redis`. Agora WhatsApp e Telegram respondem `200 OK` instantaneamente (evitando *timeouts* ou desativação de webhooks pela Meta) e processam as requisições LLM em background.
2. **Separação de Testes**: Suíte de testes (E2E, Canais, Memória, Exaustão/Jailbreak) concentrada puramente no diretório `scripts/tests/`.
3. **CI/CD Integrado**: Build movido da VM para o GitHub Actions, com imagens armazenadas no GitHub Container Registry (GHCR) para evitar travamentos de falta de memória (OOM) na e2-micro.

### 4.2. Fase 5: Dashboard Administrativo e Frontend (PRÓXIMO PASSO 🎯)
1. **Painel do Cliente**: Interface para gerenciar Persona e Knowledge Base via Front-end sem uso direto de `.env`.
2. **Dashboard de Leads**: Visualização de interações.
3. **Widget de Chat**: Componente pronto para ser colado na Home dos clientes.

### 4.3. Fase 6: Tool Use e Integrações
1. **Function Calling**: Permitir que a Agente consulte o banco de dados em tempo real.
2. **Integração CRM / Gestão (Linear)**: Acesso a tickets e issues em tempo real via Function Calling.

### 4.4. Otimização de Custos e Roteamento (Concluído ✅)
1. **Filtro de Heurística e Regex**: Adicionamos no `cachedClassifications.ts` reconhecimento por Regex de intenções padrão e atalhos rápidos para barrar chamadas à LLM antes que aconteçam.
2. **Correção de Orquestrador Multi-Tenant**: Orquestrador ajustado para passar a task limpa sem poluir cache; banco de dados de classificações atualizado para isolamento por `clientId`.
3. **Cache Vetorial com `pgvector`**: Migramos a busca de perguntas idênticas para similaridade semântica (cosseno < 0.20), reduzindo severamente os custos operacionais do Gemini e respondendo questões similares em ~15ms via Banco de Dados.

## 5. Variáveis de Ambiente (.env)
Variáveis essenciais para os novos canais e segurança:
- `ENCRYPTION_KEY`: Chave mestra alfanumérica (64 caracteres) gerada para criptografia AES-256-GCM.
- `TELEGRAM_BOT_TOKEN`: Token do bot mestre.
- `TELEGRAM_VERIFY_TOKEN`: Chave de segurança para a URL do Webhook.
- `CLIENT_WHATSAPP_*`: Credenciais do WhatsApp Sandbox.
- `REDIS_URL`: URL de conexão para o BullMQ/Redis (ex: `redis://redis:6379` na produção).

---
*Última atualização: 16 de Junho de 2026 (Migração para o Supabase PostgreSQL, Otimização de Recursos na VM do GCP)*
