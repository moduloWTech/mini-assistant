import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';
import { ensureClientConfigs } from '../services/ensureClientConfigs';

const repo = new MethodsRepository();

export async function smalltalkAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  let config = await prisma.smalltalkConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.smalltalkConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual profissional e acolhedor.";
  const agentDesc = config?.agentDescription || "Assistente cordial e prestativo.";
  const guidelines = config?.smalltalkGuidelines || "Responda de forma breve, amigável e natural.";

  const systemPrompt = `
    PERSONA: ${persona}

    INSTRUÇÃO: ${agentDesc}
    - Diretrizes de Conversa: ${guidelines}
    - Responda de forma breve, amigável e natural em português.
  `;

  const userPrompt = `Pergunta casual do usuário: "${task}"`;

  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);

    if (!choice || choice.length === 0) {
      return { message: "Olá! Como posso ajudar você hoje?" };
    }

    // Salva a pergunta e a resposta no banco em segundo plano
    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "smalltalkAgent");
    return { message: "Olá! Estou à disposição para ajudar você com todas as dúvidas e informações que precisar." };
  }
}
