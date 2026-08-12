import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { postRouter } from './router/POST';
import { clientRouter } from "./router/client";
import { authRouter } from "./router/auth";
import { whatsappRouter } from "./channels/whatsapp/router";
import { webRouter } from "./channels/web/router";
import { telegramRouter } from "./channels/telegram/router";
import { getWidgetScript } from "./channels/web/widgetScript";
import "./queue/messageQueue"; // Import to initialize the queue and worker

dotenv.config();

const app = express();

app.use(express.json());

// 🔒 CORS Estrito para o Dashboard Administrativo
const strictCors = cors({ origin: process.env.CORS_ORIGIN });

// 🌐 CORS Aberto para o Widget Web
const openCors = cors({ origin: '*' });

// Rota estática do Script do Widget (Permite que qualquer site insira <script src=".../widget.js" data-client-id="..."></script>)
app.get("/widget.js", openCors, (req, res) => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  const hostUrl = `${protocol}://${host}`;
  
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(getWidgetScript(hostUrl));
});

// Aplicar CORS explícito e direto na rota web (Resolve OPTIONS)
app.use("/channels/web", openCors, webRouter);

// Aplicar CORS estrito explicitamente nas rotas fechadas
app.use("/client", strictCors, clientRouter);
app.use("/auth", strictCors, authRouter);
app.use("/task", strictCors, postRouter);

// 🤖 Rotas de Webhooks (Sem CORS, comunicação Server-to-Server)
app.use("/webhook/whatsapp", whatsappRouter);
app.use("/channels/telegram", telegramRouter);

export default app;