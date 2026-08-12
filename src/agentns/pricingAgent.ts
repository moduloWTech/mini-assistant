import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';
import { EmbeddingService } from '../services/embeddingService';

const repo = new MethodsRepository();
const embeddingService = new EmbeddingService();

export async function pricingAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  // 1. FAST-PATH: Checa o Cache Vetorial PRIMEIRO (Zero chamada LLM / RAG)
  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) {
      console.log("⚡ [CACHE HIT] Resposta encontrada no cache semântico de preços!");
      return { message: cached.response };
    }
  } catch (err) {
    console.error("Erro ao checar cache vetorial:", err);
  }

  const config = await prisma.pricingConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    return { message: "Configuração de precificação não encontrada para este cliente." };
  }

  // 2. Busca Semântica (RAG) apenas se não houver no cache
  let contextText = "";
  try {
    const queryVector = await embeddingService.generateEmbedding(task);
    const relevantChunks = await repo.findRelevantKnowledge(queryVector, clientId, 'pricing', 3);
    contextText = relevantChunks.join("\n\n");
  } catch (error) {
    console.error("Erro ao buscar conhecimento de preços (RAG):", error);
  }

  const systemPrompt = `
    PERSONA: ${config.client.systemPersona || "Você é um assistente profissional especializado em preços."}

    INSTRUÇÃO: ${config.agentDescription}
    - Instrução Adicional: ${config.noPricingInfoText}
    - Responda baseando-se no CONTEXTO abaixo, mas sempre mantendo sua PERSONA e diretrizes da empresa. Se não encontrar o preço, siga a instrução adicional.
    
    CONTEXTO:
    ${contextText || "Nenhuma tabela de preços encontrada."}
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);
    if (!choice || choice.length === 0) {
      return { message: "Parece que houve um erro. Pode tentar novamente? Eu estou aqui para ajudar!" };
    }

    // 3. Salva a pergunta e a resposta no cache vetorial
    await repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    });
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "pricingAgent");
    return { message: "Posso fazer um orçamento com base no seu projeto! Preencha o formulário no site e logo entro em contato 😉" };
  }
}