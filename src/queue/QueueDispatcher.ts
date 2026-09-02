import { messageQueue } from './messageQueue';
import crypto from 'crypto';

export class QueueDispatcher {
  /**
   * Encaminha uma mensagem para a fila com garantia de idempotência.
   * 
   * @param channel O canal de onde a mensagem se originou (whatsapp ou telegram)
   * @param data Os dados originais da mensagem
   * @param providerMessageId O ID único oficial enviado pelo provedor do canal
   */
  static async dispatch(
    channel: 'whatsapp' | 'telegram',
    data: any,
    providerMessageId: string
  ): Promise<void> {
    // Cria um hash SHA-256 combinando o canal, cliente e ID oficial da mensagem
    // Isso garante que tentativas duplicadas (retries do webhook) gerem exatamente o mesmo hash
    const hash = crypto
      .createHash('sha256')
      .update(`${channel}-${data.clientId}-${providerMessageId}`)
      .digest('hex');

    const jobName = `${channel}-message`;

    // A passagem do jobId garante que o BullMQ ignore silenciosamente as mensagens duplicadas
    await messageQueue.add(jobName, data, {
      jobId: hash,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000 // Inicia esperando 5s, depois 10s, 20s...
      }
    });

    console.log(`[QueueDispatcher] Job enfileirado para ${channel}. Idempotency Key: ${hash}`);
  }
}
