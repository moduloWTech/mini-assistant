import { Router, Request, Response } from "express";
import { prisma } from "../../DB/prisma.config";
import { QueueDispatcher } from "../../queue/QueueDispatcher";

const telegramRouter = Router();

/**
 * Endpoint Dinâmico para Webhooks do Telegram
 * URL: POST /webhook/:verifyToken
 */
telegramRouter.post("/:verifyToken", async (req: Request, res: Response) => {
  const { verifyToken } = req.params;
  const update = req.body;

  // Telegram pode mandar atualizações que não são mensagens (ex: edit_message)
  if (!update || !update.message || !update.message.text) {
    return res.sendStatus(200);
  }

  console.log("[Telegram] Payload bruto recebido:", JSON.stringify(update));

  const text = update.message.text;
  const chatId = update.message.chat.id;

  try {
    // 1. Busca o cliente pelo Token de Verificação (Segurança)
    const client = await prisma.client.findFirst({
      where: { telegramVerifyToken: verifyToken as string }
    });

    if (!client || !client.telegramBotToken) {
      console.error(`[Telegram] Nenhum cliente encontrado para o token: ${verifyToken}`);
      return res.sendStatus(404);
    }

    console.log(`[Telegram] Mensagem para ${client.name} (Chat: ${chatId}): ${text}`);

    const name = update.message.from.first_name || update.message.from.username || "User";

    const messageId = update.message.message_id.toString();

    // 2. Add message to processing queue via Dispatcher
    await QueueDispatcher.dispatch('telegram', {
      channel: 'telegram',
      chatId,
      text,
      clientId: client.id,
      name
    }, messageId);

    res.sendStatus(200);
  } catch (error: any) {
    let innerErrors = "";
    if (error.name === 'AggregateError' && error.errors) {
      innerErrors = "\\nInner Errors: " + JSON.stringify(error.errors.map((e: any) => e.message || e.code));
    }
    const errorLog = `[Telegram] Erro ao processar webhook: ${error.stack || error.message}${innerErrors}\n${JSON.stringify(error.response?.data || "No response data")}\n`;
    console.error(errorLog);
    require('fs').appendFileSync('telegram_error.log', new Date().toISOString() + ' ' + errorLog);
    res.sendStatus(200); // Retorna 200 para o Telegram não desativar o webhook
  }
});

export { telegramRouter };
