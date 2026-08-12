import { IFindSimilarQuestion, IKnowledgeChunkData, IMethodsRepository, ISaveToDatabase } from "../interfaces/interfaces";
import { prisma } from "../DB/prisma.config";
import { Classification } from "@prisma/client";
import { generateEmbedding } from "../services/embeddingService";

export class MethodsRepository implements IMethodsRepository {
    async saveKnowledgeChunk(data: IKnowledgeChunkData): Promise<void> {
        const vectorString = `[${data.embedding.join(',')}]`;

        // Usamos $executeRawUnsafe para lidar com o cast ::vector que o Prisma/pg-client não entende nativamente no mapeamento de tipos
        await prisma.$executeRawUnsafe(
            `INSERT INTO "KnowledgeChunk" ("id", "content", "category", "clientId", "embedding", "createdAt", "updatedAt") 
             VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW(), NOW())`,
            data.content,
            data.category,
            data.clientId,
            vectorString
        );
    }

    async findRelevantKnowledge(queryVector: number[], clientId: string, category: string, limit: number): Promise<string[]> {
        const vectorString = `[${queryVector.join(',')}]`;

        // Busca semântica usando distância de cosseno (<=>) do pgvector
        const results = await prisma.$queryRawUnsafe<{ content: string }[]>(
            `SELECT content FROM "KnowledgeChunk" 
             WHERE "clientId" = $1 AND "category" = $2 
             ORDER BY "embedding" <=> $3::vector 
             LIMIT $4`,
            clientId,
            category,
            vectorString,
            limit
        );

        return results.map(row => row.content);
    }

    async saveToDatabase(data: ISaveToDatabase): Promise<Classification> {
        const embedding = await generateEmbedding(data.question);
        const vectorString = `[${embedding.join(',')}]`;

        const result = await prisma.$queryRawUnsafe<Classification[]>(
            `INSERT INTO "Classification" ("question", "response", "clientId", "embedding", "createdAt")
             VALUES ($1, $2, $3, $4::vector, NOW())
             RETURNING id, question, response, "clientId", "createdAt"`,
            data.question,
            data.response,
            data.clientId,
            vectorString
        );
        
        return result[0];
    }

    async findSimilarQuestion(data: IFindSimilarQuestion): Promise<Classification | null> {
        const queryVector = await generateEmbedding(data.question);
        const vectorString = `[${queryVector.join(',')}]`;

        // Busca com distância de cosseno (<=>) menor que 0.35 (similaridade semântica > 65%)
        const result = await prisma.$queryRawUnsafe<Classification[]>(
            `SELECT id, question, response, "clientId", "createdAt" 
             FROM "Classification" 
             WHERE "clientId" = $1 AND ("embedding" <=> $2::vector) < 0.35
             ORDER BY "embedding" <=> $2::vector 
             LIMIT 1`,
            data.clientId,
            vectorString
        );

        if (result.length > 0) {
            console.log("✅ [CACHE VETORIAL] Resposta encontrada no cache!");
            return result[0];
        }

        return null;
    };
}