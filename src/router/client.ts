import { Router, Request, Response } from "express";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { encryptToken } from "../utils/encryption";

const clientRouter = Router();

// Helper function to get the correct config model based on agentType
const getConfigModel = (agentType: string) => {
  switch (agentType) {
    case "contact":
      return prisma.contactConfig;
    case "history":
      return prisma.historyConfig;
    case "memory":
      return prisma.memoryConfig;
    case "pricing":
      return prisma.pricingConfig;
    case "services":
      return prisma.servicesConfig;
    case "smalltalk":
      return prisma.smalltalkConfig;
    default:
      return null;
  }
};

/**
 * GET /client/profile - Retorna os dados completos do cliente logado
 */
clientRouter.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        niche: true,
        systemPersona: true,
        whatsappPhoneNumberId: true,
        telegramBotToken: true,
        webhookUrl: true,
        allowedDomains: true,
        createdAt: true
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    res.status(200).json({
      ...client,
      hasTelegram: !!client.telegramBotToken
    });
  } catch (error) {
    console.error("[ClientRouter] Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

/**
 * PUT /client/profile - Atualiza nome, empresa e persona do assistente
 */
clientRouter.put("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { name, companyName, systemPersona } = req.body;

  try {
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(systemPersona !== undefined && { systemPersona })
      }
    });

    res.status(200).json({
      message: "Perfil e persona atualizados com sucesso!",
      client: updatedClient
    });
  } catch (error) {
    console.error("[ClientRouter] Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao salvar perfil." });
  }
});

/**
 * PUT /client/channels/telegram - Configura o token do Telegram Bot (criptografado)
 */
clientRouter.put("/channels/telegram", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { botToken } = req.body;

  if (!botToken) {
    return res.status(400).json({ error: "O token do Telegram é obrigatório." });
  }

  try {
    const encryptedToken = encryptToken(botToken);
    await prisma.client.update({
      where: { id: clientId },
      data: { telegramBotToken: encryptedToken }
    });

    res.status(200).json({ message: "Token do Telegram configurado e criptografado com sucesso!" });
  } catch (error) {
    console.error("[ClientRouter] Erro ao salvar Telegram:", error);
    res.status(500).json({ error: "Erro ao salvar token do Telegram." });
  }
});

/**
 * PUT /client/channels/whatsapp - Configura credenciais da Meta Cloud API (criptografado)
 */
clientRouter.put("/channels/whatsapp", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { phoneNumberId, accessToken } = req.body;

  if (!phoneNumberId) {
    return res.status(400).json({ error: "O Phone Number ID é obrigatório." });
  }

  try {
    const data: any = { whatsappPhoneNumberId: phoneNumberId };
    if (accessToken) {
      data.whatsappAccessToken = encryptToken(accessToken);
    }

    await prisma.client.update({
      where: { id: clientId },
      data
    });

    res.status(200).json({ message: "Credenciais do WhatsApp salvas com sucesso!" });
  } catch (error) {
    console.error("[ClientRouter] Erro ao salvar WhatsApp:", error);
    res.status(500).json({ error: "Erro ao salvar credenciais do WhatsApp." });
  }
});

/**
 * PUT /client/tools/webhook - Configura URL de Webhook para CRM
 */
clientRouter.put("/tools/webhook", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { webhookUrl } = req.body;

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { webhookUrl: webhookUrl || null }
    });

    res.status(200).json({ message: "URL de Webhook atualizada com sucesso!" });
  } catch (error) {
    console.error("[ClientRouter] Erro ao salvar Webhook:", error);
    res.status(500).json({ error: "Erro ao salvar Webhook." });
  }
});

// POST /client - Create a new client (legacy admin)
clientRouter.post("/", async (req: Request, res: Response) => {
  const { name, companyName, email } = req.body;

  if (!name || !companyName || !email) {
    return res.status(400).json({ error: "Name, companyName, and email are required." });
  }

  try {
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        companyName,
        email,
      },
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { clientRouter };