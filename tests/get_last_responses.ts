import { prisma } from './src/DB/prisma.config';
async function test() {
  const msgs = await prisma.message.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log(msgs.map(m => m.role + ": " + m.content).join("\n\n"));
}
test();
