import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from "../providers/callGeminiAgent";
import { erroAgente } from "../providers/erroAgent";
import { prisma } from '../DB/prisma.config';
import { EmbeddingService } from "../providers/embeddingService";
import { ensureClientConfigs } from "../providers/ensureClientConfigs";

const repo = new MethodsRepository();
const embeddingService = new EmbeddingService();

export async function historyAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  // 1. FAST-PATH: Checa o Cache Vetorial PRIMEIRO
  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) {
      console.log("⚡ [CACHE HIT] Resposta encontrada no cache semântico de história!");
      return { message: cached.response };
    }
  } catch (err) {
    console.error("Erro ao checar cache vetorial:", err);
  }

  let config = await prisma.historyConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.historyConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual profissional.";
  const agentDesc = config?.agentDescription || "Especialista na história e valores da empresa.";

  // 2. Busca Semântica (RAG)
  let contextText = "";
  try {
    const queryVector = await embeddingService.generateEmbedding(task);
    const relevantChunks = await repo.findRelevantKnowledge(queryVector, clientId, 'history', 3);
    contextText = relevantChunks.join("\n\n");
  } catch (error) {
    console.error("Erro ao buscar conhecimento (RAG):", error);
  }

  const systemPrompt = `
    PERSONA: ${persona}
    
    INSTRUÇÃO: ${agentDesc}
    - Seu objetivo é responder perguntas sobre nossa empresa e história de forma amigável e clara.
    
    BASE DE CONHECIMENTO DISPONÍVEL:
    ${contextText || "Explique nossa trajetória e compromisso com excelência."}
  `;

  const userPrompt = `Pergunta do usuário: "${task}"`;

  try {
    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);

    if (!choice || choice.length === 0) {
      return { message: "Nossa empresa é dedicada a entregar as melhores soluções com transparência e inovação." };
    }

    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "historyAgent");
    return { message: "Desculpe, tive um problema ao buscar essas informações no momento." };
  }
}
