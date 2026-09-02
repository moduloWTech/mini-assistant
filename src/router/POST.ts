import { Router, Request, Response } from "express"; 
import { orchestrator } from "../orchestrator/orchestrator";
import { formatResponse } from "../providers/formatResponse";

const postRouter = Router();

postRouter.post('/', async (req: Request, res: Response) => {
  const { question } = req.body;
  const clientId = req.headers['x-client-id'] as string;

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).send({ error: 'Question is required and must be a non-empty string!' });
    return;
  }

  if (!clientId) {
    res.status(400).send({ error: 'Client ID is required in the X-Client-ID header!' });
    return;
  }

  try {
    const result = await orchestrator(question, question, clientId);
    const formattedResult = formatResponse(result.message);
    res.status(200).json({ response: formattedResult });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { postRouter };