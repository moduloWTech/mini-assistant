import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini-Assistant Enterprise API",
      version: "2.0.0",
      description: "API de Plataforma SaaS Multi-Agente com RAG Vetorial (pgvector), Canais Omnichannel (WhatsApp, Telegram, Web) e Function Calling.",
      contact: {
        name: "MW Technology",
        url: "https://github.com/claudiojas/mini-assistant"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento Local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        clientIdHeader: {
          type: "apiKey",
          in: "header",
          name: "X-Client-ID"
        }
      }
    }
  },
  apis: ["./src/router/*.ts", "./src/channels/**/*.ts"]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📚 [Docs] Swagger UI disponível na rota /api-docs");
};
