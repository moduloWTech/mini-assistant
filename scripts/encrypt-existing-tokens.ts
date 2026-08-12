import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { encryptToken, decryptToken } from "../src/utils/encryption";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function encryptExistingTokens() {
  try {
    console.log("Iniciando migração de segurança (Criptografia de Tokens)...");
    
    const clients = await prisma.client.findMany();
    let updatedCount = 0;

    for (const client of clients) {
      let needsUpdate = false;
      const dataToUpdate: any = {};

      if (client.whatsappAccessToken && !client.whatsappAccessToken.includes(":")) {
        dataToUpdate.whatsappAccessToken = encryptToken(client.whatsappAccessToken);
        needsUpdate = true;
      }

      if (client.telegramBotToken && !client.telegramBotToken.includes(":")) {
        dataToUpdate.telegramBotToken = encryptToken(client.telegramBotToken);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prisma.client.update({
          where: { id: client.id },
          data: dataToUpdate,
        });
        updatedCount++;
        console.log(`Cliente ${client.companyName} (${client.id}) teve seus tokens criptografados.`);
      }
    }

    console.log(`Migração concluída! ${updatedCount} clientes atualizados.`);
  } catch (error) {
    console.error("Erro durante a migração:", error);
  } finally {
    await prisma.$disconnect();
  }
}

encryptExistingTokens();
