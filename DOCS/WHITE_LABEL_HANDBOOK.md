# 📘 Manual de Entrega & White-Label: Mini-Assistant Enterprise

Este documento é o **Guia Oficial de Transferência de Propriedade e Customização White-Label** do sistema **Mini-Assistant Enterprise**. Ele foi elaborado para que qualquer empresa compradora possa operar, customizar a marca e escalar a plataforma com total autonomia.

---

## 🏛️ 1. Arquitetura do Sistema

O sistema é estruturado no formato **SaaS Multi-Tenant API-First**:

1. **Dashboard Administrativo (Frontend):** Localizado na pasta `/dashboard`, construído em SPA moderna com TailwindCSS e Lucide Icons. Pode ser customizado com as cores e logo do comprador.
2. **Core Multi-Agente & Orquestrador:** Localizado em `/src/orchestrator` e `/src/agentns`, desacoplado dos canais de entrada.
3. **Multi-LLM Gateway com Fallback:** `/src/services/llm/llmGateway.ts` chaveia automaticamente entre **Google Gemini 2.5 Flash** e **OpenAI GPT-4o-mini** com circuit-breaker.
4. **Banco Vetorial & RAG:** Armazenamento vetorial no **PostgreSQL (pgvector)** com índice HNSW em 768 dimensões.
5. **Mensageria Assíncrona:** Fila **Redis + BullMQ** em `/src/queue/messageQueue.ts` para processamento não bloqueante de webhooks.
6. **Segurança B2B:** Criptografia simétrica `AES-256-GCM` para todos os tokens de canais de clientes.

---

## ⚙️ 2. Guia de Instalação e Inicialização Rápida (Turnkey)

### Pré-requisitos:
- **Node.js** (v20 ou superior)
- **Docker & Docker Compose**
- Chave de API do **Google Gemini** e/ou **OpenAI**

### Passo a Passo:
```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd mini-assistant

# 2. Execute o script de provisionamento automático
./deploy.sh
```

---

## 🎨 3. Customização da Marca (White-Label)

Para aplicar a identidade visual da sua empresa:

1. **Nome e Logo do Sistema:**
   - Edite o arquivo `/dashboard/index.html` e `/dashboard/app.js` alterando o título `Mini-Assistant` para o nome do seu produto.
   - Troque as cores primárias no objeto `theme.extend.colors.brand` no script do Tailwind em `/dashboard/index.html`.
2. **Personalidade Padrão do Robô:**
   - Edite os prompts iniciais em `src/agentns/` para refletir o nicho da sua empresa.
3. **Domínio e Certificado SSL:**
   - Aponte seu domínio (ex: `app.suaempresa.com.br`) via Cloudflare ou Nginx Proxy Manager apontando para a porta `3000`.

---

## 🔌 4. Integração de Canais para Clientes

- **Widget Web:** Qualquer site pode incluir o chat adicionando:
  ```html
  <script src="https://sua-api.com/widget.js" data-client-id="SEU_CLIENT_ID" defer></script>
  ```
- **Telegram:** Basta criar o bot no `@BotFather`, colar o token no painel e o webhook é ativado automaticamente.
- **WhatsApp:** Conexão nativa com a Meta Cloud API via `/webhook/whatsapp`.

---

## 📚 5. Documentação da API

A documentação interativa completa de todos os endpoints REST está disponível via Swagger em:
`http://localhost:3000/api-docs`

---
*Mini-Assistant Enterprise - Desenvolvido para Alta Disponibilidade e Escala Comercial.*
