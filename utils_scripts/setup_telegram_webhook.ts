import localtunnel from 'localtunnel';
import { prisma } from '../src/DB/prisma.config';
import { decryptToken } from '../src/utils/encryption';
import axios from 'axios';

async function setupWebhook() {
  try {
    const client = await prisma.client.findFirst({
      where: { telegramBotToken: { not: null } }
    });

    if (!client || !client.telegramBotToken || !client.telegramVerifyToken) {
      console.log('Nenhum cliente com bot do Telegram configurado no banco.');
      process.exit(1);
    }

    console.log(`Cliente encontrado: ${client.name}`);
    console.log('Iniciando localtunnel na porta 3000...');
    
    const tunnel = await localtunnel({ port: 3000 });
    console.log(`Localtunnel ativo: ${tunnel.url}`);

    const webhookUrl = `${tunnel.url}/channels/telegram/${client.telegramVerifyToken}`;
    console.log(`Configurando Webhook no Telegram para: ${webhookUrl}`);

    const decryptedToken = decryptToken(client.telegramBotToken);
    const telegramApiUrl = `https://api.telegram.org/bot${decryptedToken}/setWebhook?url=${webhookUrl}`;
    const response = await axios.get(telegramApiUrl);
    
    console.log('Resposta do Telegram:', response.data);
    console.log('\n✅ PRONTO! Pode testar o bot no Telegram. (MANTENHA ESTE SCRIPT RODANDO)');

    tunnel.on('close', () => {
      console.log('O túnel foi fechado.');
    });

  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
  }
}

setupWebhook();
