import { prisma } from "../src/DB/prisma.config";

describe("Database Connectivity", () => {
  it("should connect to the database and perform a simple query", async () => {
    try {
      // Try to query the database
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      expect(result).toEqual([{ connected: 1 }]);
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  });

  it("should be able to access the Client model", async () => {
    // Just checking if we can query the table, even if it's empty
    const clients = await prisma.client.findMany({ take: 1 });
    expect(Array.isArray(clients)).toBe(true);
  });
});
