import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/DB/prisma.config";

async function seedAdmin() {
  console.log("🌱 Criando usuário administrador inicial...");

  const email = "admin@mwtechnology.com.br";
  const rawPassword = "123456";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Encontra ou cria o Client padrão
  let client = await prisma.client.findFirst({
    where: { companyName: "MW Technology" }
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: "Claudio Soares",
        email: "contato@moduloweb.com.br",
        companyName: "MW Technology",
        niche: "services",
        systemPersona: "Você é a Keiko, assistente inteligente da MW Technology. Seu tom é profissional, simpático e acolhedor."
      }
    });
  }

  // 2. Encontra ou cria o User
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      clientId: client.id,
      role: "admin"
    },
    create: {
      name: "Administrador MW",
      email,
      password: hashedPassword,
      clientId: client.id,
      role: "admin"
    }
  });

  // 3. Garante que há uma assinatura ativa
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      clientId: client.id,
      plan: "pro",
      status: "active",
      monthlyMessageLimit: 5000,
      currentPeriodEnd: oneMonthFromNow
    }
  }).catch(() => {});

  console.log("==================================================");
  console.log("✅ Usuário Administrador configurado com sucesso!");
  console.log(`👉 E-mail: ${email}`);
  console.log(`👉 Senha:  ${rawPassword}`);
  console.log(`👉 Client ID: ${client.id}`);
  console.log("==================================================");
}

seedAdmin().catch(console.error).finally(() => prisma.$disconnect());
