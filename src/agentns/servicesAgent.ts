import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from "../providers/callGeminiAgent";
import { erroAgente } from "../providers/erroAgent";
import { prisma } from '../DB/prisma.config';
import { EmbeddingService } from "../providers/embeddingService";
import { ensureClientConfigs } from "../providers/ensureClientConfigs";

const repo = new MethodsRepository();
const embeddingService = new EmbeddingService();

export async function servicesAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  // 1. FAST-PATH: Checa o Cache Vetorial PRIMEIRO (Zero chamada LLM / RAG)
  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) {
      console.log("⚡ [CACHE HIT] Resposta encontrada no cache semântico!");
      return { message: cached.response };
    }
  } catch (err) {
    console.error("Erro ao checar cache vetorial:", err);
  }

  let config = await prisma.servicesConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.servicesConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual profissional.";
  const agentDesc = config?.agentDescription || "Especialista nos produtos e serviços oferecidos.";
  const conversationStyle = config?.conversationStyle || "Profissional, claro e objetivo.";

  // 2. Busca Semântica (RAG)
  let contextText = "";
  try {
    const queryVector = await embeddingService.generateEmbedding(task);
    const relevantChunks = await repo.findRelevantKnowledge(queryVector, clientId, 'services', 3);
    contextText = relevantChunks.join("\n\n");
  } catch (error) {
    console.error("Erro ao buscar conhecimento (RAG):", error);
  }

  const systemPrompt = `
    PERSONA: ${persona}
    
    INSTRUÇÃO: ${agentDesc}
    - Estilo de Conversa: ${conversationStyle}
    - Utilize os dados abaixo para responder a pergunta do cliente.
    
    BASE DE CONHECIMENTO DISPONÍVEL:
    ${contextText || "Apresente os serviços de forma clara e convide o usuário para mais detalhes."}
  `;

  const userPrompt = `Pergunta do usuário: "${task}"`;

  try {
    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);

    if (!choice || choice.length === 0) {
      return { message: "Temos diversas soluções e serviços disponíveis. Como posso detalhar para você?" };
    }

    // Salva no banco de dados para cache futuro
    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "servicesAgent");
    return { message: "Estamos com uma breve instabilidade para consultar nossos serviços. Por favor, tente novamente em instantes!" };
  }
}
