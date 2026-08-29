import { prisma } from '../src/DB/prisma.config';

async function run() {
  console.log("Limpando banco de dados para recomeçar do zero...");
  
  const msg = await prisma.message.deleteMany({});
  console.log(`Apagados ${msg.count} mensagens (Message)`);
  
  const cls = await prisma.classification.deleteMany({});
  console.log(`Apagados ${cls.count} caches de resposta (Classification)`);
  
  const chunks = await prisma.knowledgeChunk.deleteMany({});
  console.log(`Apagados ${chunks.count} blocos de conhecimento (KnowledgeChunk)`);
  
  const docs = await prisma.documentSource.deleteMany({});
  console.log(`Apagados ${docs.count} documentos/URLs fontes (DocumentSource)`);
  
  const leads = await prisma.lead.deleteMany({});
  console.log(`Apagados ${leads.count} leads (Lead)`);
  
  const users = await prisma.endUser.deleteMany({});
  console.log(`Apagados ${users.count} usuários finais (EndUser)`);
  
  console.log("Limpeza concluída! A Agente perdeu toda a memória antiga e está zerada.");
  await prisma.$disconnect();
}
run();
