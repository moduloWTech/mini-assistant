import { Router, Request, Response } from "express";
import { prisma } from "../../DB/prisma.config";
import { messageQueue } from "../../queue/messageQueue";

const whatsappRouter = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// GET /webhook/whatsapp - Webhook verification
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

// POST /webhook/whatsapp - Handle incoming messages
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
    const text = message.text.body;

    console.log(`Received message from ${from} for number ID ${phoneNumberId}: ${text}`);

    // 1. Identify clientId based on the whatsappPhoneNumberId
    const client = await prisma.client.findFirst({
      where: { whatsappPhoneNumberId: phoneNumberId },
    });

    if (!client || !client.whatsappAccessToken) {
      console.error(`No configured client found for phone number ID: ${phoneNumberId}`);
      return res.sendStatus(200); // Return 200 to prevent webhook disabling
    }

    const clientId = client.id;
    const name = change.value.contacts?.[0]?.profile?.name || "User";

    // 2. Add message to processing queue
    await messageQueue.add('whatsapp-message', {
      channel: 'whatsapp',
      phoneNumberId,
      from,
      text,
      clientId,
      name
    });

    // 3. Return 200 immediately to Meta
    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    res.sendStatus(200); // Always return 200 to Meta
  }
});

export { whatsappRouter };