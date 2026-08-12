import { MethodsRepository } from "../src/repository/methods.repository";
import { prisma } from "../src/DB/prisma.config";
const repo = new MethodsRepository();

const TEST_CLIENT_ID = "test-client-vector-123";

async function runTests() {
  console.log("==================================================");
  console.log("🛡️ Iniciando Testes do Cache Vetorial (pgvector) ");
  console.log("==================================================\n");

  try {
    // 1. Limpa testes anteriores
    await prisma.classification.deleteMany({
      where: { clientId: TEST_CLIENT_ID }
    });
    
    // Certifica-se de que o cliente existe
    const client = await prisma.client.upsert({
      where: { id: TEST_CLIENT_ID },
      update: {},
      create: {
        id: TEST_CLIENT_ID,
        name: "Test Client",
        email: "test@vector.com",
        companyName: "Vector Test Co"
      }
    });

    console.log("📝 1. Salvando pergunta base no banco de dados (Simulando uma resposta da LLM)...");
    const baseQuestion = "Qual é o valor do plano básico?";
    const response = "O plano básico custa R$49,90.";
    
    await repo.saveToDatabase({
      clientId: TEST_CLIENT_ID,
      question: baseQuestion,
      response: response
    });
    console.log(`✅ Salvo: "${baseQuestion}" -> "${response}"\n`);

    console.log("📝 2. Buscando pergunta com texto diferente, mas sentido IGUAL (Similaridade Semântica)...");
    const similarQuestion = "Quanto eu pago no pacote mais barato?";
    
    console.log(`🔎 Pergunta: "${similarQuestion}"`);
    const startTime1 = Date.now();
    const cached1 = await repo.findSimilarQuestion({ question: similarQuestion, clientId: TEST_CLIENT_ID });
    const endTime1 = Date.now();

    if (cached1) {
      console.log(`✅ SUCESSO! Cache vetorial ativado em ${endTime1 - startTime1}ms!`);
      console.log(`🤖 Resposta retornada: "${cached1.response}"`);
    } else {
      console.log(`❌ FALHOU! O pgvector não encontrou similaridade suficiente.`);
    }

    console.log("\n📝 3. Buscando pergunta totalmente diferente...");
    const differentQuestion = "Como eu cancelo a minha assinatura?";
    
    console.log(`🔎 Pergunta: "${differentQuestion}"`);
    const startTime2 = Date.now();
    const cached2 = await repo.findSimilarQuestion({ question: differentQuestion, clientId: TEST_CLIENT_ID });
    const endTime2 = Date.now();

    if (!cached2) {
      console.log(`✅ SUCESSO! Cache recusado corretamente em ${endTime2 - startTime2}ms (Vai para LLM).`);
    } else {
      console.log(`❌ FALHOU! O pgvector achou similaridade errada e retornou a resposta de preço.`);
    }

  } catch (err) {
    console.error("❌ Erro durante o teste:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
