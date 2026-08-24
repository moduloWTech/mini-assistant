import { Router, Response } from "express";
import axios from "axios";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { decryptToken } from "../utils/encryption";

const inboxRouter = Router();

inboxRouter.use(authMiddleware);

/**
 * GET /inbox/conversations - Listar conversas ativas dos usuários finais
 */
inboxRouter.get("/conversations", async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    const endUsers = await prisma.endUser.findMany({
      where: { clientId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const conversations = endUsers.map((user) => ({
      id: user.id,
      chatId: user.chatId,
      name: user.name || "Usuário Anônimo",
      platform: user.platform || "web",
      isAiPaused: user.isAiPaused && (!user.pausedUntil || new Date(user.pausedUntil) > new Date()),
      lastMessage: user.messages[0]?.content || "Sem mensagens",
      lastMessageTime: user.messages[0]?.createdAt || user.updatedAt
    }));

    res.status(200).json(conversations);
  } catch (error) {
    console.error("[InboxRouter] Erro ao buscar conversas:", error);
    res.status(500).json({ error: "Erro ao buscar conversas." });
  }
});

/**
 * GET /inbox/conversations/:endUserId/messages - Histórico completo de mensagens de um usuário
 */
inboxRouter.get("/conversations/:endUserId/messages", async (req: AuthRequest, res: Response) => {
  const endUserId = req.params.endUserId as string;
  const clientId = req.user?.clientId;

  try {
    const endUser = await prisma.endUser.findFirst({
      where: { id: endUserId, clientId }
    });

    if (!endUser) {
      return res.status(404).json({ error: "Conversa não encontrada." });
    }

    const messages = await prisma.message.findMany({
      where: { endUserId: endUser.id },
      orderBy: { createdAt: "asc" }
    });

    res.status(200).json({
      endUser: {
        id: endUser.id,
        name: endUser.name,
        chatId: endUser.chatId,
        platform: endUser.platform,
        isAiPaused: endUser.isAiPaused
      },
      messages
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mensagens." });
  }
});

/**
 * POST /inbox/conversations/:endUserId/toggle-ai - Pausar ou retomar a IA para atendimento humano
 */
inboxRouter.post("/conversations/:endUserId/toggle-ai", async (req: AuthRequest, res: Response) => {
  const endUserId = req.params.endUserId as string;
  const { pause } = req.body; // boolean
  const clientId = req.user?.clientId;

  try {
    const pausedUntil = pause ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const updated = await prisma.endUser.updateMany({
      where: { id: endUserId, clientId },
      data: {
        isAiPaused: !!pause,
        pausedUntil
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({
      message: pause ? "IA pausada. Atendimento manual ativado." : "IA retomada com sucesso.",
      isAiPaused: !!pause
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao alterar estado da IA." });
  }
});

/**
 * POST /inbox/conversations/:endUserId/reply - Atendente humano envia mensagem manual para o usuário
 */
inboxRouter.post("/conversations/:endUserId/reply", async (req: AuthRequest, res: Response) => {
  const endUserId = req.params.endUserId as string;
  const { message } = req.body;
  const clientId = req.user?.clientId;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  try {
    const endUser = await prisma.endUser.findFirst({
      where: { id: endUserId, clientId }
    });

    if (!endUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // 1. Salva a mensagem no histórico do banco como "agent"
    const savedMessage = await prisma.message.create({
      data: {
        endUserId: endUser.id,
        role: "agent",
        content: message
      }
    });

    // 2. Se for WhatsApp ou Telegram, despacha a mensagem via API
    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (endUser.platform === "whatsapp" && client?.whatsappAccessToken && client.whatsappPhoneNumberId) {
      const token = decryptToken(client.whatsappAccessToken);
      await axios.post(
        `https://graph.facebook.com/v19.0/${client.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: endUser.chatId,
          type: "text",
          text: { body: message }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } else if (endUser.platform === "telegram" && client?.telegramBotToken) {
      const botToken = decryptToken(client.telegramBotToken);
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: endUser.chatId,
        text: message
      });
    }

    res.status(200).json({
      message: "Mensagem enviada com sucesso.",
      data: savedMessage
    });
  } catch (error: any) {
    console.error("[InboxRouter] Erro ao responder usuário:", error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem para o canal do usuário." });
  }
});

export { inboxRouter };
