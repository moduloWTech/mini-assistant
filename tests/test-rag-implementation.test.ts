import { MethodsRepository } from "../src/repository/methods.repository";
import { prisma } from "../src/DB/prisma.config";

describe("MethodsRepository - RAG Implementation", () => {
    const repository = new MethodsRepository();
    const testClientId = "test-client-rag-id";

    beforeAll(async () => {
        // Garantir que o cliente de teste existe
        await prisma.client.upsert({
            where: { id: testClientId, email: "test-rag@example.com" },
            update: {},
            create: {
                id: testClientId,
                name: "Test Client RAG",
                email: "test-rag@example.com",
                companyName: "Test Agency RAG"
            }
        });
    });

    afterAll(async () => {
        // Limpar dados de teste
        await prisma.knowledgeChunk.deleteMany({ where: { clientId: testClientId } });
        await prisma.client.delete({ where: { id: testClientId } });
        await prisma.$disconnect();
    });

    it("should save a knowledge chunk with vector correctly", async () => {
        const dummyVector = new Array(3072).fill(0).map((_, i) => i / 3072);
        
        await expect(repository.saveKnowledgeChunk({
            clientId: testClientId,
            content: "O plano Pro custa R$ 299/mês.",
            category: "pricing",
            embedding: dummyVector
        })).resolves.not.toThrow();

        const chunks = await prisma.knowledgeChunk.findMany({
            where: { clientId: testClientId }
        });

        expect(chunks.length).toBe(1);
        expect(chunks[0].content).toBe("O plano Pro custa R$ 299/mês.");
    });

    it("should find relevant knowledge using semantic search", async () => {
        // Adicionar mais chunks para testar a busca
        const v1 = new Array(3072).fill(0);
        v1[0] = 1; // Vetor "perto" de v1_query

        const v2 = new Array(3072).fill(0);
        v2[100] = 1; // Vetor "longe" de v1_query

        await repository.saveKnowledgeChunk({
            clientId: testClientId,
            content: "Informação relevante 1",
            category: "services",
            embedding: v1
        });

        await repository.saveKnowledgeChunk({
            clientId: testClientId,
            content: "Informação irrelevante",
            category: "services",
            embedding: v2
        });

        const queryVector = new Array(3072).fill(0);
        queryVector[0] = 0.9; // Similar a v1

        const results = await repository.findRelevantKnowledge(queryVector, testClientId, "services", 1);
        
        expect(results.length).toBe(1);
        expect(results[0]).toBe("Informação relevante 1");
    });
});
