import { EmbeddingService } from "../src/providers/embeddingService";
import dotenv from "dotenv";

dotenv.config();

describe("Gemini Embedding API Test", () => {
    const embeddingService = new EmbeddingService();

    it("should generate an embedding for a sample text", async () => {
        const text = "Este é um teste de integração com a API de Embeddings do Gemini.";
        
        try {
            const embedding = await embeddingService.generateEmbedding(text);
            
            console.log("Vetor gerado com sucesso!");
            console.log("Tamanho do vetor:", embedding.length);
            console.log("Primeiros 5 valores:", embedding.slice(0, 5));

            // O modelo gemini-embedding-2 retorna um vetor de 768 dimensões
            expect(embedding).toBeDefined();
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding.length).toBe(768);
        } catch (error) {
            console.error("Erro no teste de embedding:", error);
            throw error;
        }
    }, 15000); // Aumentando o timeout para chamadas de API
});
