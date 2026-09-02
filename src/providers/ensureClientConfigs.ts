import { prisma } from "../DB/prisma.config";

/**
 * Garante que todas as tabelas de configuração de agentes e persona estejam criadas para o cliente (tenant).
 */
export async function ensureClientConfigs(clientId: string, clientName?: string, systemPersona?: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    if (!client) return;

    const name = clientName || client.name || "Assistente Virtual";
    const persona = systemPersona || client.systemPersona || `Você é o assistente virtual inteligente da ${name}. Seja profissional, atencioso, claro e resolutivo.`;

    if (!client.systemPersona) {
      await prisma.client.update({
        where: { id: clientId },
        data: { systemPersona: persona }
      });
    }

    // 1. SmalltalkConfig
    const existingSmalltalk = await prisma.smalltalkConfig.findFirst({ where: { clientId } });
    if (!existingSmalltalk) {
      await prisma.smalltalkConfig.create({
        data: {
          clientId,
          agentDescription: `Assistente cordial e prestativo da ${name}.`,
          smalltalkGuidelines: "Responda saudações e conversas casuais de forma simpática, breve e convidativa."
        }
      });
    }

    // 2. ServicesConfig
    const existingServices = await prisma.servicesConfig.findFirst({ where: { clientId } });
    if (!existingServices) {
      await prisma.servicesConfig.create({
        data: {
          clientId,
          agentDescription: `Especialista nos produtos e serviços oferecidos pela ${name}.`,
          conversationStyle: "Profissional, consultivo e focado em esclarecer dúvidas sobre os serviços."
        }
      });
    }

    // 3. HistoryConfig
    const existingHistory = await prisma.historyConfig.findFirst({ where: { clientId } });
    if (!existingHistory) {
      await prisma.historyConfig.create({
        data: {
          clientId,
          agentDescription: `Especialista na história, valores e proposta de valor da ${name}.`
        }
      });
    }

    // 4. PricingConfig
    const existingPricing = await prisma.pricingConfig.findFirst({ where: { clientId } });
    if (!existingPricing) {
      await prisma.pricingConfig.create({
        data: {
          clientId,
          agentDescription: `Especialista em planos, condições comerciais e orçamento da ${name}.`,
          noPricingInfoText: "Caso não encontre os valores exatos na base de conhecimento, convide o cliente a falar com a equipe de vendas."
        }
      });
    }

    // 5. ContactConfig
    const existingContact = await prisma.contactConfig.findFirst({ where: { clientId } });
    if (!existingContact) {
      await prisma.contactConfig.create({
        data: {
          clientId,
          agentDescription: `Especialista em suporte e direcionamento de contato da ${name}.`,
          contactSuggestion: "Solicite o nome, WhatsApp ou e-mail do cliente para que nossa equipe entre em contato."
        }
      });
    }

    // 6. MemoryConfig
    const existingMemory = await prisma.memoryConfig.findFirst({ where: { clientId } });
    if (!existingMemory) {
      await prisma.memoryConfig.create({
        data: {
          clientId,
          agentDescription: `Responsável por manter o contexto da conversa e preferências do cliente.`,
          memoryGuidelines: "Considere as mensagens anteriores do usuário para manter respostas coerentes."
        }
      });
    }
  } catch (error) {
    console.error("[ensureClientConfigs] Erro ao garantir configurações do cliente:", error);
  }
}
