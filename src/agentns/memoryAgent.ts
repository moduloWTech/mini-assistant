import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from "../providers/callGeminiAgent";
import { erroAgente } from "../providers/erroAgent";
import { prisma } from '../DB/prisma.config';
import { ensureClientConfigs } from "../providers/ensureClientConfigs";

const repo = new MethodsRepository();

export async function memoryAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  let config = await prisma.memoryConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.memoryConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual profissional.";
  const agentDesc = config?.agentDescription || "Responsável por manter o contexto da conversa.";
  const memoryGuidelines = config?.memoryGuidelines || "Considere as mensagens anteriores do usuário.";

  const systemPrompt = `
    PERSONA: ${persona}

    INSTRUÇÃO: ${agentDesc}
    - Diretrizes de Memória: ${memoryGuidelines}
    - Responda de forma breve, amigável e natural.
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);
    if (!choice || choice.length === 0) {
      return { message: "Entendido! Como posso ajudar você agora?" };
    }

    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));

    return { message: choice };
  } catch (error) {
    erroAgente(error, "memoryAgent");
    return { message: "Compreendido! Estou à disposição para prosseguir." };
  }
}
