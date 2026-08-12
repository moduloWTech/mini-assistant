import dotenv from "dotenv";
dotenv.config(); // Carrega as envs locais PRIMEIRO!

import { orchestrator } from "../../src/orchestrator/orchestrator";
import { prisma } from "../../src/DB/prisma.config";

async function testMemory() {
  console.log("🔍 Buscando um cliente válido no banco de dados...");

  let client = await prisma.client.findFirst({
    include: {
      smalltalkConfig: true,
      memoryConfig: true,
    }
  });

  if (!client) {
    console.error("❌ Nenhum cliente encontrado no banco de dados para realizar o teste.");
    process.exit(1);
  }

  // Cria a configuração se não existir
  if (client.smalltalkConfig.length === 0) {
    console.log("⚠️ Criando SmalltalkConfig provisória para o teste...");
    await prisma.smalltalkConfig.create({
      data: {
        clientId: client.id,
        smalltalkGuidelines: "Seja muito amigável, chame o usuário pelo nome se souber, e aja como um humano.",
        agentDescription: "Você é a Keiko, assistente virtual simpática.",
      }
    });
  }

  if (client.memoryConfig.length === 0) {
    console.log("⚠️ Criando MemoryConfig provisória para o teste...");
    await prisma.memoryConfig.create({
      data: {
        clientId: client.id,
        memoryGuidelines: "Lembre-se sempre de quem você está falando baseado no histórico, se ele informou o nome, use-o.",
        agentDescription: "Você é a Keiko, uma assistente com excelente memória.",
      }
    });
  }

  const clientId = client.id;
  const userId = "teste_memoria_123";

  console.log(`✅ Cliente selecionado: ${client.name} (ID: ${clientId})`);
  console.log(`👤 Usuário Simulado (chatId): ${userId}\n`);
  console.log("Iniciando conversa...\n");

  const turnos = [
    "Olá! O meu nome é Claudio e eu adoro programar em Node.js.",
    "Qual é o meu nome?",
    "Você lembra o que eu gosto de fazer?",
  ];

  for (let i = 0; i < turnos.length; i++) {
    const chat = turnos[i];
    console.log(`[Turno ${i + 1}] 👤 Usuário: ${chat}`);

    const resposta = await orchestrator(chat, chat, clientId, userId);

    console.log(`[Turno ${i + 1}] 🤖 Keiko (Categoria: ${resposta.category}): ${resposta.message}\n`);

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log("✅ Teste finalizado!");
}

testMemory().catch(console.error).finally(() => process.exit(0));
