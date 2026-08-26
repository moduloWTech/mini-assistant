import { Router, Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { encryptToken, decryptToken } from "../utils/encryption";
import { ensureClientConfigs } from "../services/ensureClientConfigs";

const clientRouter = Router();

/**
 * GET /client/profile - Retorna os dados completos do cliente logado
 */
clientRouter.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    if (!clientId) {
      return res.status(401).json({ error: "Não autorizado." });
    }

    // Garante que o cliente possui todas as configurações inicializadas
    await ensureClientConfigs(clientId);

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
        telegramVerifyToken: true,
        webhookUrl: true,
        allowedDomains: true,
        activeTools: true,
        googleCalendarToken: true,
        createdAt: true
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    res.status(200).json({
      ...client,
      hasTelegram: !!client.telegramBotToken,
      hasWhatsApp: !!client.whatsappPhoneNumberId,
      hasGoogleCalendar: !!client.googleCalendarToken
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

    // Sincroniza configurações dos sub-agentes com o novo nome e persona
    await ensureClientConfigs(clientId!, name, systemPersona);

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
 * PUT /client/channels/telegram - Configura o token do Telegram Bot e registra webhook
 */
clientRouter.put("/channels/telegram", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { botToken, publicBaseUrl } = req.body;

  if (!botToken) {
    return res.status(400).json({ error: "O token do Telegram é obrigatório." });
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: { telegramVerifyToken: true }
    });

    const verifyToken = existingClient?.telegramVerifyToken || crypto.randomBytes(16).toString("hex");
    const encryptedToken = encryptToken(botToken);

    await prisma.client.update({
      where: { id: clientId },
      data: {
        telegramBotToken: encryptedToken,
        telegramVerifyToken: verifyToken
      }
    });

    // Tenta registrar o Webhook automaticamente na API do Telegram se houver URL pública configurada
    let registeredWithTelegram = false;
    let telegramApiError = null;

    if (publicBaseUrl && publicBaseUrl.startsWith("https://")) {
      const webhookUrl = `${publicBaseUrl.replace(/\/$/, "")}/channels/telegram/${verifyToken}`;
      try {
        const tgRes = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
          url: webhookUrl
        }, { timeout: 5000 });
        if (tgRes.data?.ok) {
          registeredWithTelegram = true;
          console.log(`[Telegram] Webhook registrado com sucesso: ${webhookUrl}`);
        }
      } catch (err: any) {
        console.warn("[Telegram] Aviso: Não foi possível registrar webhook automaticamente no Telegram:", err.message);
        telegramApiError = err.response?.data?.description || err.message;
      }
    }

    res.status(200).json({
      message: "Token do Telegram configurado com sucesso!",
      verifyToken,
      registeredWithTelegram,
      telegramApiError
    });
  } catch (error) {
    console.error("[ClientRouter] Erro ao salvar Telegram:", error);
    res.status(500).json({ error: "Erro ao salvar token do Telegram." });
  }
});

/**
 * PUT /client/channels/domains - Configura domínios autorizados para o Web Widget
 */
clientRouter.put("/channels/domains", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { allowedDomains } = req.body;

  try {
    let domains: string[] = ["*"];
    if (Array.isArray(allowedDomains)) {
      domains = allowedDomains.map(d => d.trim()).filter(Boolean);
    } else if (typeof allowedDomains === "string") {
      domains = allowedDomains.split(",").map(d => d.trim()).filter(Boolean);
    }

    if (domains.length === 0) domains = ["*"];

    await prisma.client.update({
      where: { id: clientId },
      data: { allowedDomains: domains }
    });

    res.status(200).json({
      message: "Domínios autorizados atualizados com sucesso!",
      allowedDomains: domains
    });
  } catch (error) {
    console.error("[ClientRouter] Erro ao atualizar domínios:", error);
    res.status(500).json({ error: "Erro ao salvar domínios." });
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

    res.status(200).json({ message: "Credenciais da Meta salvas com sucesso!" });
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

/**
 * PUT /client/tools/google-calendar - Configura integração com Google Calendar
 */
clientRouter.put("/tools/google-calendar", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { calendarToken, enabled } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { activeTools: true }
    });

    let currentTools: string[] = Array.isArray(client?.activeTools) ? (client?.activeTools as string[]) : [];

    if (enabled) {
      if (!currentTools.includes("google_calendar")) currentTools.push("google_calendar");
    } else {
      currentTools = currentTools.filter(t => t !== "google_calendar");
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        googleCalendarToken: calendarToken ? encryptToken(calendarToken) : (enabled ? "enabled_auto" : null),
        activeTools: currentTools
      }
    });

    res.status(200).json({
      message: enabled ? "Google Calendar conectado e ativado com sucesso!" : "Google Calendar desativado.",
      hasGoogleCalendar: enabled
    });
  } catch (error) {
    console.error("[ClientRouter] Erro ao salvar Calendar:", error);
    res.status(500).json({ error: "Erro ao salvar configuração do Google Calendar." });
  }
});

export { clientRouter };
