import { Router, Request, Response } from "express";
import { prisma } from '../DB/prisma.config';

const clientRouter = Router();

// Helper function to get the correct config model based on agentType
const getConfigModel = (agentType: string) => {
  switch (agentType) {
    case "contact":
      return prisma.contactConfig;
    case "history":
      return prisma.historyConfig;
    case "memory":
      return prisma.memoryConfig;
    case "pricing":
      return prisma.pricingConfig;
    case "services":
      return prisma.servicesConfig;
    case "smalltalk":
      return prisma.smalltalkConfig;
    default:
      return null;
  }
};

// POST /client - Create a new client
clientRouter.post("/", async (req: Request, res: Response) => {
  const { name, companyName, email } = req.body;

  if (!name || !companyName || !email) {
    return res.status(400).json({ error: "Name, companyName, and email are required." });
  }

  try {
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        companyName,
        email,
      },
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /client/:clientId/config/:agentType - Add a new agent configuration for a client
clientRouter.post("/:clientId/config/:agentType", async (req: Request, res: Response) => {
  const { clientId, agentType } = req.params as { clientId: string; agentType: string };
  const configData = req.body;

  const configModel = getConfigModel(agentType);
  if (!configModel) {
    return res.status(400).json({ error: `Invalid agent type: ${agentType}` });
  }

  try {
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
    if (!clientExists) {
      return res.status(404).json({ error: "Client not found." });
    }

    const newConfig = await (configModel as any).create({
      data: {
        clientId,
        ...configData,
      },
    });
    res.status(201).json(newConfig);
  } catch (error) {
    console.error(`Error adding ${agentType} config for client ${clientId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /client/:clientId/config/:agentType/:configId - Update an existing agent configuration
clientRouter.put("/:clientId/config/:agentType/:configId", async (req: Request, res: Response) => {
  const { clientId, agentType, configId } = req.params as { clientId: string; agentType: string; configId: string };
  const configData = req.body;

  const configModel = getConfigModel(agentType);
  if (!configModel) {
    return res.status(400).json({ error: `Invalid agent type: ${agentType}` });
  }

  try {
    const updatedConfig = await (configModel as any).update({
      where: { id: configId, clientId },
      data: configData,
    });
    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error(`Error updating ${agentType} config ${configId} for client ${clientId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /client/:clientId/config/:agentType/:configId - Delete an agent configuration
clientRouter.delete("/:clientId/config/:agentType/:configId", async (req: Request, res: Response) => {
  const { clientId, agentType, configId } = req.params as { clientId: string; agentType: string; configId: string };

  const configModel = getConfigModel(agentType);
  if (!configModel) {
    return res.status(400).json({ error: `Invalid agent type: ${agentType}` });
  }

  try {
    await (configModel as any).delete({
      where: { id: configId, clientId },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error(`Error deleting ${agentType} config ${configId} for client ${clientId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { clientRouter };