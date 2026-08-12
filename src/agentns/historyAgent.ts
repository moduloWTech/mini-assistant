import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';
import { EmbeddingService } from '../services/embeddingService';

const repo = new MethodsRepository();
const embeddingService = new EmbeddingService();

export async function historyAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  // 1. FAST-PATH: Checa o Cache Vetorial PRIMEIRO (Zero chamada LLM / RAG)
  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) {
      console.log("⚡ [CACHE HIT] Resposta encontrada no cache semântico de história!");
      return { message: cached.response };
    }
  } catch (err) {
    console.error("Erro ao checar cache vetorial:", err);
  }

  const config = await prisma.historyConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    return { message: "Configuração de histórico não encontrada para este cliente." };
  }

  // 2. Busca Semântica (RAG) apenas se não houver no cache
  let contextText = "";
  try {
    const queryVector = await embeddingService.generateEmbedding(task);
    const relevantChunks = await repo.findRelevantKnowledge(queryVector, clientId, 'history', 3);
    contextText = relevantChunks.join("\n\n");
  } catch (error) {
    console.error("Erro ao buscar conhecimento (RAG):", error);
  }

  const systemPrompt = `
    PERSONA: ${config.client.systemPersona || "Você é um assistente profissional."}
    
    INSTRUÇÃO: ${config.agentDescription}
    - Seu objetivo é responder perguntas de forma amigável, breve e natural.
    - Responda baseando-se no CONTEXTO RECUPERADO abaixo, mas sempre mantendo sua PERSONA e princípios fundamentais.
    - Se a informação não estiver no contexto, use sua persona para explicar educadamente que não possui essa informação específica.
    
    CONTEXTO RECUPERADO:
    ${contextText || "Nenhuma informação específica encontrada no banco de dados."}
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);
   
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
    erroAgente(error, "historyAgent");
    return { message: "Poxa, não consegui entender direito agora sobre a história. Você pode tentar perguntar de outro jeito?" };
  }
}