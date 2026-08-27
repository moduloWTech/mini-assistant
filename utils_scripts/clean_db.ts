import { prisma } from '../src/DB/prisma.config';
async function run() {
  const res = await prisma.message.deleteMany({});
  console.log('Apagados: ' + res.count);
  await prisma.$disconnect();
}
run();
