import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';

const repo = new MethodsRepository();

export async function memoryAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {

  const config = await prisma.memoryConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    return { message: "Configuração de memória não encontrada para este cliente." };
  }

  const systemPrompt = `
    PERSONA: ${config.client.systemPersona || "Você é um assistente profissional."}

    INSTRUÇÃO: ${config.agentDescription}
    - Diretrizes de Memória: ${config.memoryGuidelines}
    - Responda de forma breve, amigável e natural.
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId)
    if (!choice || choice.length === 0) {
      return { message: "Parece que houve um erro. Pode tentar novamente? Eu estou aqui para ajudar!" };
    }

    // 3. Salva a pergunta e a resposta no banco
    await repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    });

    return { message: choice };
  } catch (error) {
    erroAgente(error, "memoryAgent");
    const respostasAlternativas = [
      "Poxa, não lembro exatamente agora 😅, mas se você puder me lembrar, fico feliz!",
      "Não consigo lembrar exatamente disso no momento, mas me conta um pouco mais e eu te ajudo!",
    ];
    return { message: respostasAlternativas[Math.floor(Math.random() * respostasAlternativas.length)] };
  }
}