import { Request, Response, NextFunction } from "express";
import { prisma } from "../DB/prisma.config";

/**
 * Middleware para validar se a requisição do Web Widget veio de um domínio autorizado pelo cliente.
 */
export const validateWidgetDomain = async (req: Request, res: Response, next: NextFunction) => {
  const { clientId } = req.body;
  const origin = req.get("origin") || req.get("referer");

  // Se não foi informado clientId, deixa o controller lidar com o erro 400
  if (!clientId) {
    return next();
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { allowedDomains: true }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const allowedDomains: string[] = Array.isArray(client.allowedDomains)
      ? (client.allowedDomains as string[])
      : ["*"];

    // Se permite qualquer domínio ("*"), libera
    if (allowedDomains.includes("*")) {
      return next();
    }

    if (!origin) {
      return next(); // Requisição direta (ex: Postman/Server-to-Server)
    }

    const originHostname = new URL(origin).hostname;
    const isAllowed = allowedDomains.some((domain) => {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
      return originHostname === cleanDomain || originHostname.endsWith(`.${cleanDomain}`);
    });

    if (!isAllowed) {
      console.warn(`[Security] Origem não autorizada: ${originHostname} para o client ${clientId}`);
      return res.status(403).json({ error: "Domínio de origem não autorizado para este assistente." });
    }

    next();
  } catch (error) {
    console.error("[DomainValidator] Erro ao validar domínio:", error);
    next();
  }
};
