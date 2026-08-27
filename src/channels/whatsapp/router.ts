import { Router, Request, Response } from "express";
import { prisma } from "../../DB/prisma.config";
import { messageQueue } from "../../queue/messageQueue";

const whatsappRouter = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "verify_token_dev";

// --- META CLOUD API OFFICIAL ENDPOINTS ---

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
    }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar mensagem do WhatsApp:", error);
    res.sendStatus(200);
  }
});

export { whatsappRouter };
