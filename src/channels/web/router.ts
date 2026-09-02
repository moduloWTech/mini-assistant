import { Router, Request, Response } from "express";
import { orchestrator } from "../../orchestrator/orchestrator";
import { formatResponse } from "../../providers/formatResponse";

const webRouter = Router();

/**
 * Endpoint para o Chat da Home / Site
 * POST /channels/web/message
 */
webRouter.post("/message", async (req: Request, res: Response) => {
  const { message, clientId, userId } = req.body;

  if (!message || !clientId) {
    return res.status(400).json({ error: "Message e clientId são obrigatórios." });
  }

  try {
    console.log(`[Web Channel] Mensagem recebida de ${clientId}: ${message}`);

    // Chama o orquestrador (cérebro único)
    const result = await orchestrator(message, message, clientId, userId || "web_user");
    
    // Formata a resposta (remove asteriscos, etc)
    const formattedResponse = formatResponse(result.message);

    return res.json({
      response: formattedResponse,
      category: result.category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[Web Channel] Erro ao processar mensagem:", error);
    return res.status(500).json({ error: "Erro interno ao processar a mensagem." });
  }
});

export { webRouter };
