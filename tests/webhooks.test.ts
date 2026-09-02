import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/DB/prisma.config";
import { messageQueue } from "../src/queue/messageQueue";

jest.setTimeout(30000);

describe("Webhooks & Idempotency Integration Tests", () => {
  let testClientId: string;
  let testVerifyToken: string;
  let testPhoneNumberId: string;

  beforeAll(async () => {
    const uniqueHash = Date.now().toString();
    testVerifyToken = `token_${uniqueHash}`;
    testPhoneNumberId = `phone_${uniqueHash}`;

    const client = await prisma.client.create({
      data: {
        name: "Test Webhook Client",
        email: `webhook_test_${uniqueHash}@example.com`,
        companyName: "Test Webhook Company",
        whatsappPhoneNumberId: testPhoneNumberId,
        telegramVerifyToken: testVerifyToken,
        whatsappAccessToken: "dummy_token",
        telegramBotToken: "dummy_bot_token"
      }
    });
    testClientId = client.id;
  });

  afterAll(async () => {
    await prisma.client.delete({ where: { id: testClientId } });
    await prisma.$disconnect();
    
    // Allow redis client to finish
    await messageQueue.close();
  });

  const getTotalJobs = async () => {
    const counts = await messageQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
    return counts.wait + counts.active + counts.completed + counts.failed + counts.delayed;
  };

  describe("Telegram Webhook", () => {
    it("should process a new telegram message successfully", async () => {
      const initialJobs = await getTotalJobs();
      
      const response = await request(app)
        .post(`/channels/telegram/${testVerifyToken}`)
        .send({
          update_id: 101,
          message: {
            message_id: 2001,
            from: { id: 999, is_bot: false, first_name: "TestUser", username: "testuser" },
            chat: { id: 999, first_name: "TestUser", type: "private" },
            date: Math.floor(Date.now() / 1000),
            text: "Hello from Telegram!"
          }
        });

      expect(response.status).toBe(200);
      
      // Delay so redis updates
      await new Promise(r => setTimeout(r, 500));
      
      const finalJobs = await getTotalJobs();
      expect(finalJobs).toBe(initialJobs + 1);
    });

    it("should discard duplicate telegram messages (Idempotency)", async () => {
      const payload = {
          update_id: 102,
          message: {
            message_id: 2002, // Unique ID for this test
            from: { id: 999, is_bot: false, first_name: "TestUser", username: "testuser" },
            chat: { id: 999, first_name: "TestUser", type: "private" },
            date: Math.floor(Date.now() / 1000),
            text: "Hello again!"
          }
      };

      // Send first time
      await request(app).post(`/channels/telegram/${testVerifyToken}`).send(payload);
      await new Promise(r => setTimeout(r, 500));
      const jobsAfterFirst = await getTotalJobs();

      // Send identical payload again
      await request(app).post(`/channels/telegram/${testVerifyToken}`).send(payload);
      await new Promise(r => setTimeout(r, 500));
      const jobsAfterSecond = await getTotalJobs();

      // The job count should NOT increase after the duplicate request
      expect(jobsAfterSecond).toBe(jobsAfterFirst);
    });
  });

  describe("WhatsApp Webhook", () => {
    const getWhatsAppPayload = (messageId: string) => ({
      object: "whatsapp_business_account",
      entry: [{
        id: "123456",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "123456",
              phone_number_id: testPhoneNumberId
            },
            contacts: [{
              profile: { name: "Test User" },
              wa_id: "5511999999999"
            }],
            messages: [{
              from: "5511999999999",
              id: messageId,
              timestamp: "1710000000",
              text: { body: "Hello from WhatsApp!" },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    });

    it("should process a new whatsapp message successfully", async () => {
      const initialJobs = await getTotalJobs();
      const payload = getWhatsAppPayload("wamid_new_1");
      
      const response = await request(app)
        .post(`/webhook/whatsapp/whatsapp`)
        .send(payload);

      expect(response.status).toBe(200);
      await new Promise(r => setTimeout(r, 500));
      const finalJobs = await getTotalJobs();
      expect(finalJobs).toBe(initialJobs + 1);
    });

    it("should discard duplicate whatsapp messages (Idempotency)", async () => {
      const payload = getWhatsAppPayload("wamid_dup_1");
      
      await request(app).post(`/webhook/whatsapp/whatsapp`).send(payload);
      await new Promise(r => setTimeout(r, 500));
      const jobsAfterFirst = await getTotalJobs();

      await request(app).post(`/webhook/whatsapp/whatsapp`).send(payload);
      await new Promise(r => setTimeout(r, 500));
      const jobsAfterSecond = await getTotalJobs();

      expect(jobsAfterSecond).toBe(jobsAfterFirst);
    });
  });
});
