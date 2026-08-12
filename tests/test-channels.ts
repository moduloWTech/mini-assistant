import axios from 'axios';
import { prisma } from '../../src/DB/prisma.config';

async function runTests() {
  const client = await prisma.client.findFirst({
    where: { telegramVerifyToken: { not: null } }
  });
  if (!client) {
    console.error("❌ Nenhum cliente encontrado no banco.");
    return;
  }

  console.log(`\n🚀 Iniciando testes para o cliente: ${client.name} (${client.id})\n`);

  // --- Teste do Canal Web ---
  try {
    console.log("🌐 Testando Canal Web Chat...");
    const webRes = await axios.post('http://localhost:3000/channels/web/message', {
      message: "Quais são os serviços de elite que vocês oferecem?",
      clientId: client.id
    });
    console.log("✅ Resposta Web Chat:", JSON.stringify(webRes.data, null, 2));
  } catch (error: any) {
    console.error("❌ Erro no Canal Web:", error.message);
  }

  console.log("\n-------------------\n");

  // --- Teste do Canal Telegram (Simulação de Webhook) ---
  try {
    console.log("✈️ Testando Canal Telegram (Simulado)...");
    const telegramPayload = {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: { id: 999, is_bot: false, first_name: "Claudio", username: "claudio" },
        chat: { id: 999, first_name: "Claudio", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "Quem fundou a MW Technology?"
      }
    };

    // Simula o envio do webhook para o nosso servidor
    const telRes = await axios.post(`http://localhost:3000/channels/telegram/${client.telegramVerifyToken}`, telegramPayload);
    console.log("✅ Resposta Webhook Telegram (Status):", telRes.status);
  } catch (error: any) {
    console.error("❌ Erro no Canal Telegram:", error.message);
  }
}

runTests();
