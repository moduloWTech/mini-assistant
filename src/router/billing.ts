import { Router, Request, Response } from "express";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

const billingRouter = Router();

/**
 * GET /billing/subscription - Informações do plano atual e uso de mensagens/tokens
 */
billingRouter.get("/subscription", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    let subscription = await prisma.subscription.findFirst({
      where: { clientId }
    });

    // Se ainda não tiver assinatura criada, cria um plano Free/Basic padrão
    if (!subscription) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      subscription = await prisma.subscription.create({
        data: {
          clientId: clientId!,
          plan: "basic",
          status: "active",
          monthlyMessageLimit: 1000,
          currentMessagesCount: 0,
          currentPeriodEnd: oneMonthFromNow
        }
      });
    }

    // Conta o total de mensagens trocadas no mês atual
    const totalMessagesMonth = await prisma.message.count({
      where: {
        endUser: { clientId },
        createdAt: { gte: subscription.currentPeriodStart }
      }
    });

    res.status(200).json({
      plan: subscription.plan,
      status: subscription.status,
      monthlyMessageLimit: subscription.monthlyMessageLimit,
      currentMessagesCount: totalMessagesMonth,
      usagePercentage: Math.min(100, Math.round((totalMessagesMonth / subscription.monthlyMessageLimit) * 100)),
      currentPeriodEnd: subscription.currentPeriodEnd
    });
  } catch (error) {
    console.error("[BillingRouter] Erro ao buscar assinatura:", error);
    res.status(500).json({ error: "Erro ao buscar dados de faturamento." });
  }
});

/**
 * POST /billing/upgrade - Upgrade de plano de assinatura
 */
billingRouter.post("/upgrade", authMiddleware, async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { newPlan } = req.body; // "basic", "pro", "enterprise"

  const PLAN_LIMITS: Record<string, number> = {
    basic: 1000,
    pro: 5000,
    enterprise: 25000
  };

  if (!newPlan || !PLAN_LIMITS[newPlan]) {
    return res.status(400).json({ error: "Plano inválido selecionado." });
  }

  try {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const subscription = await prisma.subscription.upsert({
      where: { id: (await prisma.subscription.findFirst({ where: { clientId } }))?.id || "temp-id" },
      update: {
        plan: newPlan,
        monthlyMessageLimit: PLAN_LIMITS[newPlan],
        status: "active",
        currentPeriodEnd: oneMonthFromNow
      },
      create: {
        clientId: clientId!,
        plan: newPlan,
        monthlyMessageLimit: PLAN_LIMITS[newPlan],
        status: "active",
        currentPeriodEnd: oneMonthFromNow
      }
    });

    res.status(200).json({
      message: `Plano atualizado para ${newPlan.toUpperCase()} com sucesso!`,
      subscription
    });
  } catch (error) {
    console.error("[BillingRouter] Erro no upgrade de plano:", error);
    res.status(500).json({ error: "Erro ao atualizar plano." });
  }
});

/**
 * POST /billing/webhook - Webhook para gateways de pagamento (Stripe / Asaas)
 */
billingRouter.post("/webhook", async (req: Request, res: Response) => {
  const event = req.body;
  console.log("[BillingWebhook] Evento de pagamento recebido:", event?.type || event?.event);

  // Processa webhook do Stripe / Asaas
  try {
    if (event.type === "checkout.session.completed" || event.event === "PAYMENT_RECEIVED") {
      const clientId = event.data?.object?.client_reference_id || event.payment?.customer;
      if (clientId) {
        await prisma.subscription.updateMany({
          where: { clientId },
          data: { status: "active" }
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[BillingWebhook] Erro ao processar webhook:", error);
    res.status(500).json({ error: "Erro no processamento do webhook" });
  }
});

export { billingRouter };
