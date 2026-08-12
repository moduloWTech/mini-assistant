import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';

const repo = new MethodsRepository();

export async function smalltalkAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {

  const config = await prisma.smalltalkConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    return { message: "Configuração de smalltalk não encontrada para este cliente." };
  }

  const historyText = config.smalltalkGuidelines;

  const systemPrompt = `
    PERSONA: ${config.client.systemPersona || "Você é um assistente profissional."}

    INSTRUÇÃO: ${config.agentDescription}
    - Diretrizes de Conversa: ${config.smalltalkGuidelines}
    - Responda de forma breve, amigável e natural.
  `;

  const userPrompt = `Pergunta casual do usuário: "${task}"`;

  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId)

    if (!choice || choice.length === 0) {
      return { message: "Parece que houve um erro. Pode tentar novamente? Eu estou aqui para ajudar!" };
    }

    // 3. Salva a pergunta e a resposta no banco em segundo plano (não trava a resposta)
    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "smalltalkAgent");
    return { message: "Oi, aqui é a Keiko. Estou com alguns problemas em meu servidor, mas já estamos tentando resolver. Jája estarei operacional e pronta para responder todas as suas questões." };
  }
}