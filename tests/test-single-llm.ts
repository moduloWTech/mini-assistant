import "dotenv/config";
import { orchestrator } from "../../src/orchestrator/orchestrator";
import { prisma } from "../../src/DB/prisma.config";

async function runTest() {
  const client = await prisma.client.findFirst({
    where: { email: "contato.moduloweb@gmail.com" }
  });

  if (!client) {
    console.error("❌ Cliente principal (contato.moduloweb@gmail.com) não encontrado no banco de dados.");
    return;
  }

  const clientId = client.id;
  const testQuestion = "Qual a capital da Islândia e qual o principal prato típico de lá?";
  
  console.log(`\n🔍 Iniciando teste de chamada única para o LLM...`);
  console.log(`💬 Pergunta: "${testQuestion}"`);
  console.log(`🏢 Client ID: ${clientId}`);

  try {
    // 1. Verificar se a pergunta já existe no cache (não deve existir)
    const existing = await prisma.classification.findFirst({
      where: {
        clientId,
        question: {
          contains: "Islândia",
          mode: "insensitive"
        }
      }
    });

    if (existing) {
      console.log(`⚠️ Alerta: Esta pergunta já possui um registro de cache no banco!`);
    } else {
      console.log(`✅ Confirmado: Pergunta não está no cache vetorial.`);
    }

    // 2. Chamar o orquestrador
    console.log(`📡 Enviando pergunta para o orquestrador (esperando chamada à LLM)...`);
    const start = Date.now();
    const result = await orchestrator(testQuestion, testQuestion, clientId, "test_user_unique");
    const duration = Date.now() - start;

    console.log(`\n📥 Resposta recebida da Agente em ${duration}ms:`);
    console.log(`🤖 Categoria Classificada: "${result.category}"`);
    console.log(`💬 Resposta: "${result.message}"`);
    console.log(`\n==========================================`);
    console.log(`🎉 O fluxo de fallback para a LLM funcionou perfeitamente!`);

  } catch (error: any) {
    console.error("❌ Erro durante o teste:", error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
