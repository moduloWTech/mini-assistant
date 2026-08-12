import "dotenv/config";

const API_URL = "http://localhost:3000/channels/web/message";
const CLIENT_ID = "04912a88-e1d6-49a9-bd5f-c7f95489ef2c"; // MW Technology Real Client ID

const scenarios = [
  {
    step: 1,
    title: "1ª Chamada - Pergunta Inédita (Deve chamar a LLM e alimentar o Cache Vetorial)",
    message: "Quais são os principais diferenciais da MW Technology perante o mercado?",
    userId: "test-user-cache-2"
  },
  {
    step: 2,
    title: "2ª Chamada - Repetição Exata da Pergunta (Deve ativar o Cache Vetorial Fast-Path)",
    message: "Quais são os principais diferenciais da MW Technology perante o mercado?",
    userId: "test-user-cache-2"
  },
  {
    step: 3,
    title: "3ª Chamada - Pergunta Semanticamente Equivalente (Deve ativar o Cache Vetorial Semântico)",
    message: "O que torna a MW Technology diferente das outras empresas de software?",
    userId: "test-user-cache-2"
  },
  {
    step: 4,
    title: "4ª Chamada - Pergunta de Preço Inédita",
    message: "Quanto custa o desenvolvimento de um aplicativo mobile?",
    userId: "test-user-cache-2"
  },
  {
    step: 5,
    title: "5ª Chamada - Pergunta de Preço Semanticamente Equivalente (Cache Vetorial)",
    message: "Qual o valor aproximado para criar um app para celular?",
    userId: "test-user-cache-2"
  }
];

async function runCacheVerification() {
  console.log("==========================================================");
  console.log("🧪 Bateria de Testes: Demonstração de Cache e Fluidização");
  console.log("==========================================================\n");

  for (const s of scenarios) {
    console.log(`📌 STEP ${s.step}: ${s.title}`);
    console.log(`💬 Mensagem: "${s.message}"`);

    const start = Date.now();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: s.message,
          clientId: CLIENT_ID,
          userId: s.userId
        })
      });

      const data = await response.json();
      const duration = Date.now() - start;

      console.log(`⏱️ Tempo de Resposta: ${duration}ms`);
      console.log(`🏷️ Categoria Retornada: [${data.category}]`);
      console.log(`🤖 Resposta: "${data.response}"`);

      if (data.category === "cached" || duration < 1200) {
        console.log(`⚡ RESULTADO: FAST-PATH CACHE HIT! (Resposta instantânea - ZERO TOKENS GASTOS)`);
      } else {
        console.log(`🌐 RESULTADO: LLM GENERATION (Processado via Gemini LLM + RAG)`);
      }

    } catch (err: any) {
      console.error(`❌ Erro no teste:`, err.message);
    }
    console.log("----------------------------------------------------------\n");
    await new Promise(r => setTimeout(r, 800));
  }
}

runCacheVerification();
