import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { AnalyticsRepository } from "../repository/relational/analytics.repository";
import { GetAnalyticsOverviewUseCase } from "../usecases/analytics/getAnalyticsOverview.usecase";

const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

// Instanciando as dependências (poderia ser feito com um container de DI como TSyringe futuramente)
const analyticsRepository = new AnalyticsRepository();
const getAnalyticsOverviewUseCase = new GetAnalyticsOverviewUseCase(analyticsRepository);

/**
 * GET /analytics/overview - Visão geral de métricas e economia de tokens
 */
analyticsRouter.get("/overview", async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  if (!clientId) {
    return res.status(401).json({ error: "Usuário não autenticado adequadamente." });
  }

  try {
    const result = await getAnalyticsOverviewUseCase.execute(clientId);
    res.status(200).json(result);
  } catch (error) {
    console.error("[AnalyticsRouter] Erro ao buscar métricas:", error);
    res.status(500).json({ error: "Erro ao gerar métricas do painel." });
  }
});

export { analyticsRouter };
