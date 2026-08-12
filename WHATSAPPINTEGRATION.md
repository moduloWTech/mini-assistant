## Integração da Aplicação SaaS (Node.js/Express) com WhatsApp Cloud API

Este guia detalha a integração da nossa aplicação **SaaS em Node.js/Express** com o **WhatsApp Cloud API**, permitindo o recebimento e processamento de mensagens, e a devolução de respostas personalizadas através de agentes configuráveis por cliente.

---

### 1. Escolha da Variante da API

Para esta integração, optamos pela **WhatsApp Cloud API (Meta/Facebook)**. Esta escolha se alinha com a natureza SaaS do projeto, oferecendo escalabilidade, menor sobrecarga de manutenção e integração direta com a infraestrutura da Meta, o que é ideal para um ambiente multi-tenant.

---

### 2. Configuração Inicial (Fora do Código)

Para configurar a integração com o WhatsApp, os seguintes passos são necessários no ambiente da Meta:

1.  **Crie uma Conta no Facebook Business Manager**: Se ainda não possuir uma.
2.  **Crie uma Conta do WhatsApp Business (WABA)**: Dentro do seu Business Manager.
3.  **Verifique sua Empresa**: Este é um passo crucial para a Meta aprovar seu negócio para o uso da API.
4.  **Registre um Número de Telefone**: Um número de telefone que não esteja associado a nenhuma conta pessoal do WhatsApp. Este será o número do seu chatbot.
5.  **Obtenha as Credenciais Necessárias**:
    *   **Phone Number ID** (ID do número de telefone)
    *   **WhatsApp Business Account ID** (ID da conta comercial do WhatsApp)
    *   **Access Token** (Token de Acesso - temporário ou permanente)
    *   **Verify Token** (Token de Verificação - uma string de sua escolha para verificar o webhook)

Esses dados são essenciais para autenticar e gerenciar a comunicação com a API do WhatsApp.

---

### 3. Configuração das Variáveis de Ambiente

As credenciais obtidas na Etapa 2 devem ser configuradas no arquivo `.env` da aplicação para garantir a segurança e a flexibilidade.

```dotenv
WHATSAPP_VERIFY_TOKEN="seu_token_de_verificacao_do_whatsapp"
WHATSAPP_ACCESS_TOKEN="seu_token_de_acesso_do_whatsapp"
WHATSAPP_BUSINESS_ACCOUNT_ID="seu_id_de_conta_comercial_do_whatsapp"
```

---

### 4. Implementação do Webhook no Express (`src/router/whatsapp.ts`)

Um novo arquivo de roteador, `src/router/whatsapp.ts`, foi criado para gerenciar a comunicação com o webhook do WhatsApp. Este roteador é responsável por:

#### 4.1. Verificação do Webhook (`GET /webhook/whatsapp`)

O WhatsApp envia uma requisição `GET` para o endpoint configurado para verificar a autenticidade do webhook. Nossa implementação valida o `hub.mode` e o `hub.verify_token` e responde com o `hub.challenge` conforme exigido pela Meta.

```typescript
// Exemplo simplificado de src/router/whatsapp.ts
whatsappRouter.get("/webhook/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403); // Forbidden
  }
});
```

#### 4.2. Recebimento e Processamento de Mensagens (`POST /webhook/whatsapp`)

O endpoint `POST` recebe as mensagens e eventos do WhatsApp. A lógica implementada inclui:

1.  **Extração de Dados**: Extrai o número de telefone do remetente (`from`) e o conteúdo da mensagem (`text`).
2.  **Identificação do Cliente (`clientId`)**: Utiliza o modelo `WhatsappNumber` do Prisma para mapear o número de telefone do WhatsApp para o `clientId` correspondente. Isso é crucial para o funcionamento multi-tenant, garantindo que a mensagem seja processada com as configurações corretas do cliente.
    *   Se o número do WhatsApp não estiver associado a um `clientId`, uma mensagem de erro ou de onboarding é enviada de volta ao usuário.
3.  **Orquestração da Tarefa**: Chama a função `orchestrator` com a mensagem do usuário e o `clientId` identificado. O `orchestrator` então classifica a tarefa e delega ao agente apropriado.
4.  **Envio da Resposta**: A resposta gerada pelo `orchestrator` é formatada e enviada de volta ao usuário do WhatsApp usando a função `sendWhatsAppMessage`.

```typescript
// Exemplo simplificado de src/router/whatsapp.ts
whatsappRouter.post("/webhook/whatsapp", async (req: Request, res: Response) => {
  // ... (extração de mensagem)

  try {
    const whatsappNumberRecord = await prisma.whatsappNumber.findUnique({
      where: { phoneNumber: from },
      select: { clientId: true },
    });

    if (!whatsappNumberRecord) {
      await sendWhatsAppMessage(from, "Desculpe, não consegui identificar sua conta...");
      return res.sendStatus(200);
    }

    const clientId = whatsappNumberRecord.clientId;
    const result = await orchestrator(text, text, clientId);
    const formattedResponse = formatResponse(result.message);

    await sendWhatsAppMessage(from, formattedResponse);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    await sendWhatsAppMessage(from, "Desculpe, ocorreu um erro...");
    res.sendStatus(500);
  } finally {
    await prisma.$disconnect(); // Desconexão do Prisma no final da requisição
  }
});
```

---

### 5. Envio de Mensagens via WhatsApp Cloud API

A função auxiliar `sendWhatsAppMessage` é responsável por enviar mensagens de texto de volta para os usuários do WhatsApp. Ela utiliza a biblioteca `axios` para fazer requisições `POST` para o endpoint da API do WhatsApp Cloud.

```typescript
// Exemplo simplificado de src/router/whatsapp.ts
async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    console.error("WhatsApp API tokens not configured.");
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Message sent to ${to}: ${message}`);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response?.data || error.message);
  }
}
```

---

### 6. Modelo `WhatsappNumber` (`prisma/schema.prisma`)

Para suportar a identificação do cliente a partir do número de telefone do WhatsApp, um novo modelo `WhatsappNumber` foi adicionado ao `prisma/schema.prisma`:

```prisma
model WhatsappNumber {
  id          String   @id @default(uuid())
  phoneNumber String   @unique
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
Este modelo mapeia um `phoneNumber` único do WhatsApp para um `clientId`, permitindo que o sistema determine qual cliente SaaS está associado a uma conversa específica.

---

### 7. Fluxo Completo da Integração com Multi-tenancy

1.  **Usuário do WhatsApp envia uma mensagem** para o número do chatbot.
2.  O **WhatsApp Cloud API** recebe a mensagem e a envia para o nosso endpoint de webhook (`POST /webhook/whatsapp`).
3.  Nosso `whatsappRouter` recebe a mensagem.
4.  O sistema consulta o banco de dados (via `WhatsappNumber` model) para **identificar o `clientId`** associado ao número de telefone do remetente.
5.  A mensagem do usuário e o `clientId` são passados para o `orchestrator`.
6.  O `orchestrator` utiliza o `classifyService` (que agora considera o `clientId` para prompts de classificação) para determinar o agente apropriado.
7.  O agente selecionado (e.g., `contactAgent`, `historyAgent`) busca suas **configurações específicas do cliente** no banco de dados (usando o `clientId`).
8.  O agente constrói prompts para o Google Gemini usando essas configurações personalizadas e a mensagem do usuário.
9.  O Google Gemini gera uma resposta.
10. O agente retorna a resposta ao `orchestrator`.
11. O `whatsappRouter` utiliza a função `sendWhatsAppMessage` para enviar a resposta de volta ao usuário via WhatsApp Cloud API.
12. O usuário recebe a resposta personalizada.

---

### 8. Boas Práticas e Considerações

*   **Janela de 24 horas:** Lembre-se da regra de 24 horas do WhatsApp para respostas. Após esse período, apenas **message templates** aprovados podem ser usados.
*   **Segurança:** Mantenha o `WHATSAPP_VERIFY_TOKEN` e `WHATSAPP_ACCESS_TOKEN` confidenciais.
*   **Escalabilidade:** Para alto volume, considere implementar filas de mensagens (e.g., RabbitMQ, SQS) para desacoplar o recebimento do webhook do processamento da LLM.
*   **LGPD/Privacidade:** Garanta a conformidade com as regulamentações de privacidade de dados ao lidar com informações de usuários do WhatsApp.
*   **Tratamento de Erros:** Implemente um tratamento robusto de erros e logging para monitorar falhas na integração.
*   **Desconexão do Prisma**: A chamada `prisma.$disconnect()` foi removida dos blocos `finally` dos agentes e do roteador do WhatsApp. A recomendação é gerenciar a desconexão do Prisma globalmente no ciclo de vida da aplicação para evitar problemas com múltiplas operações de banco de dados.

---

### 9. Próximos Passos

*   Implementar um mecanismo para o cliente SaaS **associar um número de WhatsApp** ao seu `clientId` (via um endpoint de API, por exemplo).
*   Adicionar suporte a **message templates** para respostas fora da janela de 24 horas.
*   Expandir o `orchestrator` para lidar com **histórico de conversas** de forma mais robusta para cada usuário do WhatsApp.
*   Considerar a implementação de **mensagens interativas (botões, listas)**.

---

**Referências oficiais:**

*   [WhatsApp Cloud API Docs (Meta)](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

Com esta integração, a aplicação está preparada para funcionar como um chatbot SaaS multi-tenant no WhatsApp, com configurações de agentes personalizáveis por cliente.