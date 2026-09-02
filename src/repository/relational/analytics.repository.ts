import { TokenUsageLog } from "@prisma/client";
import { prisma } from "../../DB/prisma.config";
import { IAnalyticsRepository, IAnalyticsCounts } from "../../interfaces/analytics.repository.interface";

export class AnalyticsRepository implements IAnalyticsRepository {
  async getCounts(clientId: string): Promise<IAnalyticsCounts> {
    const [totalConversations, totalMessages, totalLeads, totalDocuments] = await Promise.all([
      prisma.endUser.count({ where: { clientId } }),
      prisma.message.count({ where: { endUser: { clientId } } }),
      prisma.lead.count({ where: { clientId } }),
      prisma.documentSource.count({ where: { clientId } })
    ]);

    return {
      totalConversations,
      totalMessages,
      totalLeads,
      totalDocuments
    };
  }

  async getRecentTokenLogs(clientId: string, limit: number): Promise<TokenUsageLog[]> {
    return prisma.tokenUsageLog.findMany({
      where: { clientId },
      take: limit,
      orderBy: { createdAt: "desc" }
    });
  }
}
