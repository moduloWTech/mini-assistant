import { TokenUsageLog } from "@prisma/client";

export interface IAnalyticsCounts {
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  totalDocuments: number;
}

export interface IAnalyticsRepository {
  getCounts(clientId: string): Promise<IAnalyticsCounts>;
  getRecentTokenLogs(clientId: string, limit: number): Promise<TokenUsageLog[]>;
}
