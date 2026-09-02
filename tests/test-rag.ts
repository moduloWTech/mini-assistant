import { generateEmbedding } from '../src/providers/embeddingService';
import { prisma } from '../src/DB/prisma.config';
import * as dotenv from 'dotenv';
dotenv.config();

async function testRAG() {
  const query = "qual o valor dos projetos da MW Technology";
  console.log(`Buscando por: "${query}"...`);

  const vector = await generateEmbedding(query);
  const vectorString = `[${vector.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<any[]>(
    `SELECT content, category, ("embedding" <=> $1::vector) as distance
     FROM "KnowledgeChunk" 
     ORDER BY "embedding" <=> $1::vector 
     LIMIT 3`,
    vectorString
  );

  console.log("Resultados da busca vetorial:");
  results.forEach(r => {
    const similarity = Math.max(0, (1 - r.distance) * 100).toFixed(1);
    console.log(`[Similaridade: ${similarity}%] Categoria: ${r.category}`);
    console.log(`Conteúdo: ${r.content}\n`);
  });
}

testRAG().catch(console.error).finally(() => prisma.$disconnect());
