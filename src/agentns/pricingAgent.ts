import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from "../providers/callGeminiAgent";
import { erroAgente } from "../providers/erroAgent";
import { prisma } from '../DB/prisma.config';
import { EmbeddingService } from "../providers/embeddingService";
import { ensureClientConfigs } from "../providers/ensureClientConfigs";

const repo = new MethodsRepository();
const embeddingService = new EmbeddingService();

export async function pricingAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  // 1. FAST-PATH: Checa o Cache Vetorial PRIMEIRO
  try {
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) {
      console.log("⚡ [CACHE HIT] Resposta encontrada no cache semântico de preços!");
      return { message: cached.response };
    }
  } catch (err) {
    console.error("Erro ao checar cache vetorial:", err);
  }

  let config = await prisma.pricingConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.pricingConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual especializado em planos e preços.";
  const agentDesc = config?.agentDescription || "Especialista em planos e condições comerciais.";
  const noPricingInfoText = config?.noPricingInfoText || "Caso não encontre os valores exatos, convide o cliente a falar com nossos especialistas.";

  // 2. Busca Semântica (RAG)
  let contextText = "";
  try {
    const queryVector = await embeddingService.generateEmbedding(task);
    const relevantChunks = await repo.findRelevantKnowledge(queryVector, clientId, 'pricing', 3);
    contextText = relevantChunks.join("\n\n");
  } catch (error) {
    console.error("Erro ao buscar conhecimento de preços (RAG):", error);
  }

  const systemPrompt = `
    PERSONA: ${persona}

    INSTRUÇÃO: ${agentDesc}
    - Instrução Adicional: ${noPricingInfoText}
    
    BASE DE CONHECIMENTO DISPONÍVEL:
    ${contextText || "Apresente nossos planos e ofereça atendimento personalizado."}
  `;

  const userPrompt = `Pergunta sobre preços: "${task}"`;

  try {
    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);

    if (!choice || choice.length === 0) {
      return { message: "Trabalhamos com planos personalizados sob medida para o seu perfil. Gostaria de receber uma proposta?" };
    }

    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "pricingAgent");
    return { message: "Desculpe, tive uma oscilação na consulta de planos. Fale com nosso suporte para receber a tabela completa!" };
  }
}
