import { MethodsRepository } from '../repository/methods.repository';
import { callGeminiAgent } from '../services/callGeminiAgent';
import { erroAgente } from '../services/erroAgent';
import { prisma } from '../DB/prisma.config';
import { ensureClientConfigs } from '../services/ensureClientConfigs';

const repo = new MethodsRepository();

export async function contactAgent(task: string, chat: string, clientId: string, userId: string = "default"): Promise<{ message: string; }> {
  let config = await prisma.contactConfig.findFirst({
    where: { clientId },
    include: { client: true }
  });

  if (!config || !config.client) {
    await ensureClientConfigs(clientId);
    config = await prisma.contactConfig.findFirst({
      where: { clientId },
      include: { client: true }
    });
  }

  const client = config?.client || await prisma.client.findUnique({ where: { id: clientId } });
  const persona = client?.systemPersona || "Você é um assistente virtual profissional.";
  const agentDesc = config?.agentDescription || "Especialista em suporte e direcionamento de contato.";
  const suggestion = config?.contactSuggestion || "Solicite os dados do cliente para que nossa equipe entre em contato.";

  const systemPrompt = `
    PERSONA: ${persona}

    INSTRUÇÃO: ${agentDesc}
    - Responda de forma breve, amigável e natural.
    - Sugestão de Contato/CTA: ${suggestion}
  `;

  const userPrompt = `Tarefa/Pergunta: "${task}"`;
  
  try { 
    const cached = await repo.findSimilarQuestion({ question: task, clientId });
    if (cached) return { message: cached.response };

    const choice = await callGeminiAgent(systemPrompt, userPrompt, clientId, userId);
   
    if (!choice || choice.length === 0) {
      return { message: "Você pode nos contatar diretamente deixando seu e-mail ou telefone por aqui!" };
    }

    repo.saveToDatabase({
      clientId,
      question: chat ? chat : "",
      response: choice, 
    }).catch(e => console.error("Erro ao salvar cache em background:", e));
    
    return { message: choice };
  } catch (error) {
    erroAgente(error, "contactAgent");
    return { message: "Você pode deixar seu contato por aqui que retornaremos em breve!" };
  }
}
