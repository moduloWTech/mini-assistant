import axios from 'axios';
import { randomUUID } from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function runE2ETest() {
  const uniqueId = randomUUID().substring(0, 8);
  const companyName = `Test Corp ${uniqueId}`;
  const email = `admin_${uniqueId}@testcorp.com`;
  
  console.log(`\n🚀 Iniciando Teste E2E (End-to-End) para ${companyName}\n`);

  try {
    // 1. Registrar a empresa
    console.log("1️⃣  Registrando nova empresa e usuário...");
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Admin Tester",
      email: email,
      password: "password123",
      companyName: companyName
    });

    const clientId = registerRes.data.client.id;
    const token = registerRes.data.token;
    console.log(`✅ Empresa registrada! Client ID: ${clientId}`);

    // 2. Configurar Personas (Agentes)
    console.log("\n2️⃣  Configurando Personas dos Agentes...");
    
    await axios.post(`${BASE_URL}/client/${clientId}/config/smalltalk`, {
      agentDescription: "Você é um atendente alegre.",
      smalltalkGuidelines: "Seja muito amigável, cumprimente o usuário e diga que a Test Corp é a melhor empresa do mundo."
    });
    console.log("   ✅ Agente Smalltalk configurado.");

    await axios.post(`${BASE_URL}/client/${clientId}/config/pricing`, {
      agentDescription: "Você informa os preços.",
      noPricingInfoText: "Nossos produtos custam a partir de R$ 9.999."
    });
    console.log("   ✅ Agente Pricing configurado.");

    // 3. Testar Canal Web (Bate-papo)
    console.log("\n3️⃣  Testando conversação (Canal Web)...");
    
    // Turno 1: Saudação (Gatilho: Smalltalk)
    console.log("   🗣️ User: 'Olá, bom dia!'");
    const chatRes1 = await axios.post(`${BASE_URL}/channels/web/message`, {
      message: "Olá, bom dia!",
      clientId: clientId
    });
    console.log(`   🤖 IA: ${chatRes1.data.response}`);
    
    // Turno 2: Preços (Gatilho: Pricing)
    console.log("\n   🗣️ User: 'Quanto custam os produtos?'");
    const chatRes2 = await axios.post(`${BASE_URL}/channels/web/message`, {
      message: "Quanto custam os produtos?",
      clientId: clientId
    });
    console.log(`   🤖 IA: ${chatRes2.data.response}`);

    console.log("\n🎉 Teste E2E concluído com sucesso! Todo o ciclo (Auth -> Setup -> Chat) está funcional.");

  } catch (error: any) {
    console.error("\n❌ Erro durante o Teste E2E:", error.response?.data || error.message);
  }
}

runE2ETest();
