import { classifyTask } from "../providers/classifyService";
import { historyAgent } from "../agentns/historyAgent";
import { servicesAgent } from "../agentns/servicesAgent";
import { memoryAgent } from "../agentns/memoryAgent";
import { smalltalkAgent } from "../agentns/smalltalkAgent";
import { pricingAgent } from "../agentns/pricingAgent";
import { contactAgent } from "../agentns/contact";
import { prisma } from "../DB/prisma.config";
import { MethodsRepository } from "../repository/methods.repository";
import { toolExecutor } from "../tools/toolExecutor";

const repo = new MethodsRepository();

export const orchestrator = async (task: string, chat: string, clientId: string, userId: string = "default") => {
  // 0. VERIFICAÇÃO DE HUMAN HANDOFF (Se a IA estiver pausada para este usuário)
  const endUser = await prisma.endUser.findUnique({
    where: { clientId_chatId: { clientId, chatId: userId } }
  });

  if (endUser?.isAiPaused && endUser.pausedUntil && new Date(endUser.pausedUntil) > new Date()) {
    console.log(`⏸️ [ORQUESTRADOR] IA pausada para o usuário ${userId}. Atendimento humano ativo.`);
    return {
      message: "", // Silêncio da IA para o atendente humano responder
      category: "human_handoff",
      isPaused: true
    };
  }

  // 1. FAST-PATH MÁXIMO (Economia de 100% dos Tokens):
  // Verifica se uma pergunta idêntica ou equivalente já foi respondida antes.
  try {
    const cachedAnswer = await repo.findSimilarQuestion({ question: task, clientId });
    if (cachedAnswer) {
      console.log("⚡⚡ [ORQUESTRADOR FAST-PATH] Resposta semântica retornada do cache em tempo recorde! (Zero LLM / Zero Tokens)");
      
      const userName = endUser?.name ? endUser.name.split(" ")[0] : "";
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

      // Registra telemetria de fast-path
      await prisma.tokenUsageLog.create({
        data: {
          clientId,
          channel: endUser?.platform || "web",
          model: "cached",
          inputTokens: 0,
          outputTokens: 0,
          isFastPath: true,
          latencyMs: 15
        }
      }).catch(() => {});

      return {
        message: processedMessage,
        category: "cached"
      };
    }
  } catch (err) {
    console.error("Erro ao verificar cache no orquestrador:", err);
  }

  // 2. Se a pergunta for inédita, classifica e executa o fluxo com o Agente Especialista
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

  // 3. Detecção e captura automática de leads quando o usuário fornece telefone/email
  const phoneMatch = task.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/);
  const emailMatch = task.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  if (phoneMatch || emailMatch || category === "contacts") {
    if (phoneMatch || emailMatch) {
      toolExecutor.execute("capture_lead", {
        name: endUser?.name || "Lead Contatado",
        phone: phoneMatch ? phoneMatch[0] : undefined,
        email: emailMatch ? emailMatch[0] : undefined,
        interest: category !== "contacts" ? category : "Interesse Geral",
        notes: `Mensagem: "${task}"`
      }, {
        clientId,
        endUserId: endUser?.id,
        channel: endUser?.platform || "web"
      }).catch(err => console.error("Erro ao registrar lead automático:", err));
    }
  }

  const userName = endUser?.name ? endUser.name.split(" ")[0] : "";

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