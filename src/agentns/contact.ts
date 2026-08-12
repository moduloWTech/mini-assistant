import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';

const repo = new MethodsRepository();

export async function contactAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {

  const config = await prisma.contactConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    return { message: "Configuração de contato não encontrada para este cliente." };
  }

  const systemPrompt = `
    PERSONA: ${config.client.systemPersona || "Você é um assistente profissional."}

    INSTRUÇÃO: ${config.agentDescription}
    - Responda de forma breve, amigável e natural.
    - Sugestão de Contato/CTA: ${config.contactSuggestion}
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId)
   
    if (!choice || choice.length === 0) {
      return { message: "Desculpe, não consegui processar sua pergunta. Tente algo diferente!" };
    }

    // 3. Salva a pergunta e a resposta no banco
    await repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    });
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "contactAgent");
    return { message: "Poxa, não consegui entender direito agora. Você pode tentar perguntar de outro jeito?" };
  }
}