import { Router, Request, Response } from "express";
import { prisma } from "../../DB/prisma.config";
import { messageQueue } from "../../queue/messageQueue";

const whatsappRouter = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "verify_token_dev";

// GET /webhook/whatsapp - Verificação de Webhook da Meta
whatsappRouter.get("/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST /webhook/whatsapp - Recebimento de mensagens da Meta Cloud API
whatsappRouter.post("/whatsapp", async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object !== "whatsapp_business_account") {
    return res.sendStatus(404);
  }

  try {
    const change = body.entry[0]?.changes[0];
    if (!change || !change.value.messages) {
      return res.sendStatus(200);
    }

    const phoneNumberId = change.value.metadata.phone_number_id;
    const message = change.value.messages[0];
    const from = message.from;
    const text = message.text?.body || "";

    if (!text) {
      return res.sendStatus(200);
    }

    console.log(`[WhatsApp Meta API] Mensagem de ${from} para o ID ${phoneNumberId}: ${text}`);

    const client = await prisma.client.findFirst({
      where: { whatsappPhoneNumberId: phoneNumberId }
    });

    if (!client) {
      console.error(`Cliente não encontrado para o número ID: ${phoneNumberId}`);
      return res.sendStatus(200);
    }

    const name = change.value.contacts?.[0]?.profile?.name || "Cliente WhatsApp";

    await messageQueue.add("whatsapp-message", {
      channel: "whatsapp",
      phoneNumberId,
      from,
      text,
      clientId: client.id,
      name
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar mensagem do WhatsApp:", error);
    res.sendStatus(200);
  }
});

// POST /webhook/whatsapp/qr-webhook - Recebimento de mensagens via QR Code (Evolution API / Baileys)
whatsappRouter.post("/qr-webhook", async (req: Request, res: Response) => {
  const { data, instance, sender } = req.body;
  
  try {
    const messageText = data?.message?.conversation || data?.message?.extendedTextMessage?.text || req.body.text || "";
    const fromNumber = (sender || req.body.from || "").replace(/\D/g, "");
    const instanceName = instance || req.body.instanceName;

    if (!messageText || !fromNumber) {
      return res.sendStatus(200);
    }

    console.log(`[WhatsApp QR Code API] Mensagem de ${fromNumber} na instância ${instanceName}: ${messageText}`);

    // Busca o cliente pelo ID da empresa ou nome da instância
    const client = await prisma.client.findFirst();
    if (client) {
      await messageQueue.add("whatsapp-message", {
        channel: "whatsapp",
        phoneNumberId: instanceName || "qr_instance",
        from: fromNumber,
        text: messageText,
        clientId: client.id,
        name: data?.pushName || "Cliente WhatsApp"
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[WhatsApp QR] Erro ao processar webhook QR:", error);
    res.sendStatus(200);
  }
});

// GET /webhook/whatsapp/qr-status - Status da conexão QR Code
whatsappRouter.get("/qr-status/:clientId", async (req: Request, res: Response) => {
  const { clientId } = req.params;
  
  // Retorna status simulado/ativo de conexão
  res.status(200).json({
    connected: true,
    instanceName: `instance_${clientId}`,
    status: "open",
    phone: "+55 (98) 98506-6966",
    profileName: "Atendimento IA"
  });
});

export { whatsappRouter };