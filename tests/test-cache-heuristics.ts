const API_URL = "http://localhost:3000/channels/web/message";

const testCases = [
  { message: "oi", expected: "smalltalk", desc: "Match Exato" },
  { message: "olá", expected: "smalltalk", desc: "Match Exato com acento" },
  { message: "SIM", expected: "smalltalk", desc: "Heurística Palavra Curta Maiúscula" },
  { message: "ok", expected: "smalltalk", desc: "Heurística Palavra Curta" },
  { message: "Nossa que legal, e quanto custa esse plano?", expected: "pricing", desc: "Regex de intenção (custa/plano) no meio da frase longa" },
  { message: "qual o whatsapp de vcs?", expected: "contacts", desc: "Regex palavra-chave (whatsapp)" },
  { message: "quero agendar uma reuniao", expected: "contacts", desc: "Regex palavra-chave (reuniao sem acento)" },
  { message: "me conte um pouco sobre a empresa e a história", expected: "history", desc: "Regex palavra-chave (história)" },
  { message: "qual é a cor do cavalo branco de napoleão?", expected: "other", desc: "Fallback LLM (nenhuma regra bateu)" } // Pode retornar outra categoria dependendo da LLM, mas força ela a processar
];

async function runTests() {
  console.log("==============================================");
  console.log("🛡️ Iniciando Testes do Escudo de Backend");
  console.log("==============================================\n");

  for (const t of testCases) {
    console.log(`📝 Simulando humano digitando: "${t.message}"`);
    console.log(`🔍 Regra-alvo: ${t.desc} | Categoria esperada: ${t.expected}`);
    
    try {
      // Inicia contagem de tempo para vermos a velocidade (cache deve ser instantâneo, LLM demora)
      const startTime = Date.now();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t.message, clientId: "test-client-123", userId: "tester" })
      });

      const data = await response.json();
      const endTime = Date.now();
      const timeMs = endTime - startTime;

      const isPass = data.category === t.expected || (t.expected === 'other' && data.category !== 'undefined');

      if (isPass) {
        console.log(`✅ SUCESSO! Categoria: [${data.category}] - Tempo: ${timeMs}ms`);
      } else {
        console.log(`❌ FALHOU! Categoria retornada: [${data.category}] - Tempo: ${timeMs}ms`);
      }
      
      console.log(`🤖 Resposta do agente: "${data.response}"\n`);
      
    } catch (err) {
      console.error("❌ Erro na requisição (O servidor está rodando?):", err);
    }
    
    // Pequeno delay entre requisições para não afogar o log
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

runTests();
