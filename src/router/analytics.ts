import { Router, Response } from "express";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

/**
 * GET /analytics/overview - Visão geral de métricas e economia de tokens
 */
analyticsRouter.get("/overview", async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    const [totalConversations, totalMessages, totalLeads, totalDocuments] = await Promise.all([
      prisma.endUser.count({ where: { clientId } }),
      prisma.message.count({ where: { endUser: { clientId } } }),
      prisma.lead.count({ where: { clientId } }),
      prisma.documentSource.count({ where: { clientId } })
    ]);

    // Fast-path statistics dos logs
    const tokenLogs = await prisma.tokenUsageLog.findMany({
      where: { clientId },
      take: 200,
      orderBy: { createdAt: "desc" }
    });

    const fastPathHits = tokenLogs.filter((log) => log.isFastPath).length;
    const totalLogs = tokenLogs.length || 1;
    const fastPathRate = Math.round((fastPathHits / totalLogs) * 100);

    // Estimativa de economia: cada chamada economiza cerca de 600 tokens ($0.00015 por msg)
    const estimatedSavingsUsd = (fastPathHits * 0.00015).toFixed(4);

    res.status(200).json({
      summary: {
        totalConversations,
        totalMessages,
        totalLeads,
        totalDocuments,
        fastPathRate: `${fastPathRate}%`,
        estimatedSavingsUsd: `$${estimatedSavingsUsd}`
      },
      recentLogs: tokenLogs.slice(0, 10)
    });
  } catch (error) {
    console.error("[AnalyticsRouter] Erro ao buscar métricas:", error);
    res.status(500).json({ error: "Erro ao gerar métricas do painel." });
  }
});

export { analyticsRouter };
