import { Router, Request, Response } from "express";
import { prisma } from '../DB/prisma.config';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { encryptToken } from "../utils/encryption";
import { ensureClientConfigs } from "../providers/ensureClientConfigs";

const authRouter = Router();

// Secret for JWT - should be in environment variables in a real application
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

// POST /auth/register - Register a new user and create a client
authRouter.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, companyName } = req.body;

  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ error: "Name, email, password, and companyName are required." });
  }

  try {
    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Client (tenant)
    const newClient = await prisma.client.create({
      data: {
        name: companyName, // Using companyName for client name for simplicity, can be refined
        companyName,
        email: `client-${email}`, // Unique email for client, distinct from user email
      },
    });

    // Create the user and link to the new client
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        clientId: newClient.id,
        role: "admin", // Default role for the first user of a client
      },
    });

    // Provision default agent configs and persona
    await ensureClientConfigs(newClient.id, companyName);

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, clientId: newClient.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully.", token, client: newClient });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /auth/login - Authenticate a user
authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Auto-heal / Ensure configs exist for this tenant
    await ensureClientConfigs(user.clientId);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, clientId: user.clientId, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Fetch client to return on login
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
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

    const clientWithVirtuals = client ? {
      ...client,
      hasTelegram: !!client.telegramBotToken,
      hasWhatsApp: !!client.whatsappPhoneNumberId,
      hasGoogleCalendar: !!client.googleCalendarToken
    } : null;

    res.status(200).json({ message: "Logged in successfully.", token, client: clientWithVirtuals });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /auth/whatsapp/callback - Handle WhatsApp Embedded Signup callback
authRouter.post("/whatsapp/callback", async (req: Request, res: Response) => {
  const { code, clientId } = req.body; // clientId should be sent from the frontend

  if (!code || !clientId) {
    return res.status(400).json({ error: "Authorization code and clientId are required." });
  }

  const APP_ID = process.env.META_APP_ID; // Substitua pelo seu App ID
  const APP_SECRET = process.env.META_APP_SECRET; // Substitua pelo seu App Secret

  try {
    // 1. Exchange the code for a short-lived user access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: code,
      },
    });
    const userAccessToken = tokenResponse.data.access_token;

    if (!userAccessToken) {
      return res.status(400).json({ error: "Failed to retrieve access token." });
    }

    // 2. (Optional but Recommended) Exchange the short-lived token for a long-lived one
    // A Meta recomenda fazer isso para que o token dure mais tempo (cerca de 60 dias)
    const longLivedTokenResponse = await axios.get(`https://graph.facebook.com/oauth/access_token`, {
        params: {
            grant_type: 'fb_exchange_token',
            client_id: APP_ID,
            client_secret: APP_SECRET,
            fb_exchange_token: userAccessToken
        }
    });
    const longLivedAccessToken = longLivedTokenResponse.data.access_token;

    // 3. Use the long-lived token to get the user's associated WABA ID and Phone Number ID.
    const debugTokenResponse = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: longLivedAccessToken,
        access_token: `${APP_ID}|${APP_SECRET}`
      }
    });

    const businessId = debugTokenResponse.data.data.granular_scopes.find((scope: any) => scope.scope === 'whatsapp_business_management').target_ids[0];

    if (!businessId) {
      return res.status(400).json({ error: "WhatsApp Business Account not found or permissions not granted." });
    }

    // Get the phone numbers associated with the WABA
    const wabaResponse = await axios.get(`https://graph.facebook.com/v19.0/${businessId}/phone_numbers`, {
      params: {
        access_token: longLivedAccessToken
      }
    });

    const phoneNumber = wabaResponse.data.data[0]; // Taking the first phone number for simplicity
    if (!phoneNumber || !phoneNumber.id) {
      return res.status(400).json({ error: "No phone numbers found for this WhatsApp Business Account." });
    }

    const phoneNumberId = phoneNumber.id;

    // 4. Save the credentials to the client's record
    await prisma.client.update({
      where: { id: clientId },
      data: {
        whatsappAccessToken: encryptToken(longLivedAccessToken),
        whatsappPhoneNumberId: phoneNumberId,
        whatsappBusinessId: businessId,
      },
    });

    res.status(200).json({ message: "WhatsApp connected successfully." });

  } catch (error: any) {
    console.error("Error during WhatsApp callback:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { authRouter };