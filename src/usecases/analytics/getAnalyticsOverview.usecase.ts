import { IAnalyticsRepository } from "../../interfaces/analytics.repository.interface";
import { TokenUsageLog } from "@prisma/client";

interface AnalyticsOverviewResult {
  summary: {
    totalConversations: number;
    totalMessages: number;
    totalLeads: number;
    totalDocuments: number;
    fastPathRate: string;
    estimatedSavingsUsd: string;
  };
  recentLogs: TokenUsageLog[];
}

export class GetAnalyticsOverviewUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(clientId: string): Promise<AnalyticsOverviewResult> {
    const counts = await this.analyticsRepository.getCounts(clientId);
    
    // Fast-path statistics dos logs
    const tokenLogs = await this.analyticsRepository.getRecentTokenLogs(clientId, 200);

    const fastPathHits = tokenLogs.filter((log) => log.isFastPath).length;
    const totalLogs = tokenLogs.length || 1;
    const fastPathRate = Math.round((fastPathHits / totalLogs) * 100);

    // Estimativa de economia: cada chamada economiza cerca de 600 tokens ($0.00015 por msg)
    const estimatedSavingsUsd = (fastPathHits * 0.00015).toFixed(4);

    return {
      summary: {
        totalConversations: counts.totalConversations,
        totalMessages: counts.totalMessages,
        totalLeads: counts.totalLeads,
        totalDocuments: counts.totalDocuments,
        fastPathRate: `${fastPathRate}%`,
        estimatedSavingsUsd: `$${estimatedSavingsUsd}`
      },
      recentLogs: tokenLogs.slice(0, 10)
    };
  }
}
