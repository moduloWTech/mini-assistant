import { prisma } from "../DB/prisma.config";

export class ChatMemoryRepository {
  /**
   * Encontra ou cria um usuário final baseado no ClientID e no ChatID (WhatsApp/Telegram).
   */
  async findOrCreateEndUser(clientId: string, chatId: string, platform: string = "unknown", name?: string) {
    let endUser = await prisma.endUser.findUnique({
      where: {
        clientId_chatId: {
          clientId,
          chatId,
        },
      },
    });

    if (!endUser) {
      endUser = await prisma.endUser.create({
        data: {
          clientId,
          chatId,
          platform,
          name,
        },
      });
    } else if (name && endUser.name !== name) {
      endUser = await prisma.endUser.update({
        where: { id: endUser.id },
        data: { name }
      });
    }

    return endUser;
  }

  /**
   * Recupera as mensagens mais recentes (limite padrão: 10 mensagens = 5 turnos).
   */
  async getRecentMessages(endUserId: string, limit: number = 10) {
    const messages = await prisma.message.findMany({
      where: { endUserId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Retorna ordenado do mais antigo para o mais novo para o array do Gemini
    return messages.reverse();
  }

  /**
   * Salva uma mensagem no histórico.
   */
  async saveMessage(endUserId: string, role: string, content: string) {
    return prisma.message.create({
      data: {
        endUserId,
        role,
        content,
      },
    });
  }
}
