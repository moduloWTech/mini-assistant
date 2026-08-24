import { Router, Response } from "express";
import { prisma } from "../DB/prisma.config";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

const leadsRouter = Router();

leadsRouter.use(authMiddleware);

/**
 * GET /leads - Listar leads do cliente com filtros
 */
leadsRouter.get("/", async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { status, channel, search } = req.query;

  try {
    const where: any = { clientId };

    if (status && typeof status === "string") {
      where.status = status;
    }

    if (channel && typeof channel === "string") {
      where.sourceChannel = channel;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { interest: { contains: search, mode: "insensitive" } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        endUser: {
          select: { chatId: true, platform: true }
        }
      }
    });

    res.status(200).json(leads);
  } catch (error) {
    console.error("[LeadsRouter] Erro ao listar leads:", error);
    res.status(500).json({ error: "Erro ao buscar leads." });
  }
});

/**
 * PATCH /leads/:leadId - Atualizar status ou notas do lead
 */
leadsRouter.patch("/:leadId", async (req: AuthRequest, res: Response) => {
  const leadId = req.params.leadId as string;
  const clientId = req.user?.clientId;
  const { status, notes, interest } = req.body;

  try {
    const updatedLead = await prisma.lead.updateMany({
      where: { id: leadId, clientId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(interest && { interest })
      }
    });

    if (updatedLead.count === 0) {
      return res.status(404).json({ error: "Lead não encontrado." });
    }

    res.status(200).json({ message: "Lead atualizado com sucesso." });
  } catch (error) {
    console.error("[LeadsRouter] Erro ao atualizar lead:", error);
    res.status(500).json({ error: "Erro ao atualizar lead." });
  }
});

/**
 * DELETE /leads/:leadId - Excluir um lead
 */
leadsRouter.delete("/:leadId", async (req: AuthRequest, res: Response) => {
  const leadId = req.params.leadId as string;
  const clientId = req.user?.clientId;

  try {
    await prisma.lead.deleteMany({
      where: { id: leadId, clientId }
    });

    res.status(200).json({ message: "Lead excluído com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir lead." });
  }
});

export { leadsRouter };
