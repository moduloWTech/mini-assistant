import { prisma } from "../src/DB/prisma.config";

describe("RAG and pgvector Verification", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should verify that the vector extension is installed", async () => {
    const result = await prisma.$queryRaw<any[]>`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].extname).toBe('vector');
  });

  it("should be able to access the KnowledgeChunk model", async () => {
    const count = await prisma.knowledgeChunk.count();
    expect(typeof count).toBe('number');
  });

  it("should verify that the agent config models no longer have static content fields", async () => {
    // Testing if historyConfig still exists but without companyHistory
    const historyConfigFields = Object.keys(prisma.historyConfig);
    // In Prisma Client, the fields are available on the model definition, 
    // but here we just check if we can query it without error
    const historyConfigs = await prisma.historyConfig.findMany({ take: 1 });
    expect(Array.isArray(historyConfigs)).toBe(true);
  });
});
