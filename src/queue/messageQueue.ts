import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { orchestrator } from '../orchestrator/orchestrator';
import { formatResponse } from '../services/formatResponse';
import { prisma } from '../DB/prisma.config';
import { decryptToken } from '../utils/encryption';
import { ChatMemoryRepository } from '../repository/chatMemory.repository';
import axios from 'axios';

const chatRepo = new ChatMemoryRepository();

// Redis connection configuration
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6380', {
    maxRetriesPerRequest: null,
});

// Create the Queue
export const messageQueue = new Queue('incoming-messages', { connection: connection as any });

// Types of jobs
interface WhatsAppJobData {
    channel: 'whatsapp';
    phoneNumberId: string;
    from: string;
    text: string;
    clientId: string;
    name?: string;
}

interface TelegramJobData {
    channel: 'telegram';
    chatId: number;
    text: string;
    clientId: string;
    name?: string;
}

type MessageJobData = WhatsAppJobData | TelegramJobData;

// Create the Worker
const worker = new Worker('incoming-messages', async (job: Job<MessageJobData>) => {
    console.log(`[Queue] Processando job ${job.id} para o canal ${job.data.channel}`);
    const { data } = job;

    try {
        if (data.channel === 'whatsapp') {
            await processWhatsAppJob(data);
        } else if (data.channel === 'telegram') {
            await processTelegramJob(data);
        }
    } catch (error) {
        console.error(`[Queue] Erro ao processar job ${job.id}:`, error);
        throw error; // Will be retried by BullMQ if configured
    }
}, { 
    connection: connection as any,
    limiter: {
        max: 8, // Limita a 8 jobs por minuto (16 requisições na API do Google)
        duration: 60000 // 60 segundos
    }
});

worker.on('completed', job => {
    console.log(`[Queue] Job ${job.id} concluído com sucesso.`);
});

worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job?.id} falhou:`, err.message);
});

// Helper functions for processing

async function processWhatsAppJob(data: WhatsAppJobData) {
    const { text, clientId, from, phoneNumberId, name } = data;

    // Garante que o EndUser exista e seu nome esteja sincronizado
    await chatRepo.findOrCreateEndUser(clientId, from, "whatsapp", name);

    const result = await orchestrator(text, text, clientId, from);
    const formattedResponse = formatResponse(result.message);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.whatsappAccessToken) {
        throw new Error(`Client or WhatsApp token not found for ID: ${clientId}`);
    }

    const accessToken = decryptToken(client.whatsappAccessToken);
    
    await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: formattedResponse },
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    console.log(`[Queue] Resposta enviada pelo WhatsApp para ${from}`);
}

async function processTelegramJob(data: TelegramJobData) {
    const { text, clientId, chatId, name } = data;

    // Garante que o EndUser exista e seu nome esteja sincronizado
    await chatRepo.findOrCreateEndUser(clientId, chatId.toString(), "telegram", name);

    const result = await orchestrator(text, text, clientId, chatId.toString());
    const formattedResponse = formatResponse(result.message);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.telegramBotToken) {
        throw new Error(`Client or Telegram bot token not found for ID: ${clientId}`);
    }

    const botToken = decryptToken(client.telegramBotToken);
    
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: formattedResponse,
        parse_mode: "Markdown" // or HTML if preferred
    });
    console.log(`[Queue] Resposta enviada pelo Telegram para ${chatId}`);
}
