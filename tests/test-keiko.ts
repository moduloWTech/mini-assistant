import "dotenv/config";
import { orchestrator } from "./src/orchestrator/orchestrator";
import { prisma } from "./src/DB/prisma.config";

async function testKeiko() {
  const clientEmail = "contato.moduloweb@gmail.com";
  const client = await prisma.client.findUnique({ where: { email: clientEmail } });

  if (!client) {
    console.error("Cliente não encontrado.");
    return;
  }

  const question = "Ola, keiko";
  console.log(`\n👤 Usuário: ${question}`);
  
  const response = await orchestrator(question, question, client.id);
  
  console.log(`\n🤖 Keiko: ${response.message}`);
  
  await prisma.$disconnect();
}

testKeiko();
