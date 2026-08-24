import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { postRouter } from "./router/POST";
import { clientRouter } from "./router/client";
import { authRouter } from "./router/auth";
import { knowledgeRouter } from "./router/knowledge";
import { leadsRouter } from "./router/leads";
import { inboxRouter } from "./router/inbox";
import { billingRouter } from "./router/billing";
import { analyticsRouter } from "./router/analytics";
import { whatsappRouter } from "./channels/whatsapp/router";
import { webRouter } from "./channels/web/router";
import { telegramRouter } from "./channels/telegram/router";
import { getWidgetScript } from "./channels/web/widgetScript";
import { setupSwagger } from "./docs/swagger";
import { globalRateLimiter, apiPublicRateLimiter, authRateLimiter } from "./middlewares/rateLimiter.middleware";
import { validateWidgetDomain } from "./middlewares/domainValidator.middleware";
import "./queue/messageQueue"; // Inicializa fila Redis e workers em background

dotenv.config();

const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(globalRateLimiter);

// 🔒 CORS para o Dashboard Administrativo
const strictCors = cors({ origin: process.env.CORS_ORIGIN || "*" });

// 🌐 CORS Aberto para o Widget Web (para funcionar em sites de clientes)
const openCors = cors({ origin: "*" });

// 🎨 Favicon Handler (Evita 404 no browser)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 🖥️ Servir o Dashboard Administrativo Estático
const dashboardPath = path.join(__dirname, "../dashboard");
app.use("/dashboard", express.static(dashboardPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(dashboardPath, "index.html"));
});

// 📚 Documentação Swagger / OpenAPI 3.0
setupSwagger(app);

// 🌐 Script do Widget Web (embeddable script)
app.get("/widget.js", openCors, (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.get("host") || "localhost:3000";
  const hostUrl = `${protocol}://${host}`;

  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(getWidgetScript(hostUrl));
});

// 💬 Canal Web (Widget) com Rate Limiter e Validação de Origem
app.use("/channels/web", openCors, apiPublicRateLimiter, validateWidgetDomain, webRouter);

// 🔐 Rotas de Autenticação e Gestão de Clientes
app.use("/auth", strictCors, authRateLimiter, authRouter);
app.use("/client", strictCors, clientRouter);
app.use("/task", strictCors, postRouter);

// 🚀 Rotas Enterprise do SaaS
app.use("/knowledge", strictCors, knowledgeRouter);
app.use("/leads", strictCors, leadsRouter);
app.use("/inbox", strictCors, inboxRouter);
app.use("/billing", strictCors, billingRouter);
app.use("/analytics", strictCors, analyticsRouter);

// 🤖 Rotas de Webhooks de Mensageria (Server-to-Server)
app.use("/webhook/whatsapp", whatsappRouter);
app.use("/channels/telegram", telegramRouter);

export default app;