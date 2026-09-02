import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/DB/prisma.config";

jest.setTimeout(30000);

describe("API Endpoints Integration Tests", () => {
  let testClientId: string;

  beforeAll(async () => {
    // Optional: Cleanup or setup test data
  });

  afterAll(async () => {
    // Cleanup test data
    if (testClientId) {
      // Delete all related configs first to satisfy foreign key constraints
      await prisma.smalltalkConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.contactConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.historyConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.memoryConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.pricingConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.servicesConfig.deleteMany({ where: { clientId: testClientId } });
      await prisma.whatsappNumber.deleteMany({ where: { clientId: testClientId } });
      await prisma.user.deleteMany({ where: { clientId: testClientId } });
      
      await prisma.client.delete({ where: { id: testClientId } });
    }
    await prisma.$disconnect();
  });

  describe("Auth Routes", () => {
    it("should register a new client and user", async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Test User",
          email: uniqueEmail,
          password: "password123",
          companyName: "Test Company"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.client).toHaveProperty("id");
      testClientId = response.body.client.id;
    });

    it("should login the registered user", async () => {
      // Since we just registered above, we need the email
      const user = await prisma.user.findFirst({ where: { clientId: testClientId } });
      
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: user?.email,
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Task/Orchestrator Routes", () => {
    it("should process a task via /task endpoint", async () => {
      // First, create a basic config for the client so the agent doesn't fail
      await prisma.smalltalkConfig.create({
        data: {
          clientId: testClientId,
          smalltalkGuidelines: "Be friendly",
          agentDescription: "handles smalltalk"
        }
      });

      const response = await request(app)
        .post("/task")
        .set("x-client-id", testClientId)
        .send({
          question: "Olá, tudo bem?"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("response");
    });

    it("should return 400 if x-client-id is missing", async () => {
      const response = await request(app)
        .post("/task")
        .send({
          question: "Hello"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Client ID is required");
    });
  });
});
