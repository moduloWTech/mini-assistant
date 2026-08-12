import { prisma } from "../src/DB/prisma.config";

async function fixVectorDimension() {
    try {
        console.log("Alterando coluna embedding para vector(3072)...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeChunk" ALTER COLUMN "embedding" TYPE vector(3072)`);
        console.log("Sucesso!");
    } catch (error) {
        console.error("Erro ao alterar coluna:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixVectorDimension();
