import { classifyTask } from "../services/classifyService";
import { historyAgent } from "../agentns/historyAgent";
import { servicesAgent } from "../agentns/servicesAgent";
import { memoryAgent } from "../agentns/memoryAgent";
import { smalltalkAgent } from "../agentns/smalltalkAgent";
import { pricingAgent } from "../agentns/pricingAgent";
import { contactAgent } from "../agentns/contact";
import { prisma } from "../DB/prisma.config";
import { MethodsRepository } from "../repository/methods.repository";

const repo = new MethodsRepository();

export const orchestrator = async (task: string, chat: string, clientId: string, userId: string = "default") => {
  // 1. FAST-PATH MÁXIMO (Economia de 100% dos Tokens):
  // Verifica se uma pergunta idêntica ou equivalente já foi respondida antes.
  try {
    const cachedAnswer = await repo.findSimilarQuestion({ question: task, clientId });
    if (cachedAnswer) {
      console.log("⚡⚡ [ORQUESTRADOR FAST-PATH] Resposta semântica retornada do cache em tempo recorde! (Zero LLM / Zero Tokens)");
      
      const endUser = await prisma.endUser.findUnique({
        where: { clientId_chatId: { clientId, chatId: userId } }
      });
      const userName = endUser?.name ? endUser.name.split(' ')[0] : "";
      let processedMessage = cachedAnswer.response;
      if (userName) {
        processedMessage = processedMessage.replace(/\{\{name\}\}/g, userName);
      } else {
        processedMessage = processedMessage
          .replace(/,\s*\{\{name\}\}/g, "")
          .replace(/\{\{name\}\},\s*/g, "")
          .replace(/\{\{name\}\}\s*/g, "")
          .trim();
        if (processedMessage.length > 0) {
          processedMessage = processedMessage.charAt(0).toUpperCase() + processedMessage.slice(1);
        }
      }

      return {
        message: processedMessage,
        category: "cached"
      };
    }
  } catch (err) {
    console.error("Erro ao verificar cache no orquestrador:", err);
  }

  // 2. Se a pergunta for inédita, classifica e executa o fluxo completo
  const category = await classifyTask(task, clientId);

  const agentMap: { [key: string]: (chat: string, task: string, clientId: string, userId: string) => Promise<{ message: string }> } = {
    history: historyAgent,
    services: servicesAgent,
    memory: memoryAgent,
    smalltalk: smalltalkAgent,
    other: smalltalkAgent,
    pricing: pricingAgent,
    contacts: contactAgent,
  };

  const agent = agentMap[category] || (async () => ({ message: "Desculpe, não entendi. Pode reformular a pergunta?" }));

  const result = await agent(chat, chat, clientId, userId);

  // Busca o EndUser correspondente para obter o nome do remetente
  const endUser = await prisma.endUser.findUnique({
    where: {
      clientId_chatId: {
        clientId,
        chatId: userId,
      },
    },
  });

  const userName = endUser?.name ? endUser.name.split(' ')[0] : "";

  let processedMessage = result.message;
  if (userName) {
    processedMessage = processedMessage.replace(/\{\{name\}\}/g, userName);
  } else {
    processedMessage = processedMessage
      .replace(/,\s*\{\{name\}\}/g, "")
      .replace(/\{\{name\}\},\s*/g, "")
      .replace(/\{\{name\}\}\s*/g, "")
      .trim();

    if (processedMessage.length > 0) {
      processedMessage = processedMessage.charAt(0).toUpperCase() + processedMessage.slice(1);
    }
  }

  return {
    message: processedMessage,
    category
  };
};