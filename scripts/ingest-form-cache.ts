import "dotenv/config";
import { MethodsRepository } from "../src/repository/methods.repository";
import { EmbeddingService } from "../src/services/embeddingService";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const repository = new MethodsRepository();
const embeddingService = new EmbeddingService();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getCategoryForQ(id: number): string {
  if (id === 1 || id === 2) return "history";
  if (id === 5 || id === 6) return "pricing";
  if (id === 14) return "smalltalk";
  if (id === 15) return "contacts";
  return "services";
}

function cleanJSON(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function ingestFormCache() {
  const clientEmail = "contato.moduloweb@gmail.com";
  
  const client = await prisma.client.findUnique({
    where: { email: clientEmail }
  });

  if (!client) {
    console.error("❌ Cliente principal (contato.moduloweb@gmail.com) não encontrado. Rode o setup do cliente primeiro.");
    await prisma.$disconnect();
    return;
  }

  const clientId = client.id;
  console.log(`🚀 Iniciando ingestão do form.md para o cliente: ${client.companyName} (${clientId})`);

  // 1. Ler e parsear form.md
  const filePath = path.join(__dirname, "../DOCS/form.md");
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo form.md não encontrado em: ${filePath}`);
    await prisma.$disconnect();
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const regex = /\*\*Q(\d+)\.\*\*(.*?)\*Sua Resposta:\*(.*?)(?=(?:\*\*Q\d+\.\*\*)|$)/gs;

  let match;
  const qas: { id: number; question: string; answer: string }[] = [];
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[1]);
    const question = match[2].trim();
    const answer = match[3].trim();
    qas.push({ id, question, answer });
  }

  console.log(`📝 Total de perguntas mestre identificadas: ${qas.length}`);
  if (qas.length === 0) {
    console.error("❌ Nenhuma pergunta encontrada no form.md. Verifique a formatação do arquivo.");
    await prisma.$disconnect();
    return;
  }

  // 2. Limpar cache vetorial antigo de Classification e base RAG de KnowledgeChunk para este cliente
  console.log("🧹 Limpando dados vetoriais antigos (Classification e KnowledgeChunk)...");
  await prisma.classification.deleteMany({ where: { clientId } });
  await prisma.knowledgeChunk.deleteMany({ where: { clientId } });

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (const qa of qas) {
    const category = getCategoryForQ(qa.id);
    console.log(`\n---------------------------------------------------------`);
    console.log(`[Q${qa.id}] Processando categoria: "${category}"...`);

    // Inserir resposta mestre em KnowledgeChunk (RAG)
    const ragContent = `Pergunta: ${qa.question}\nResposta: ${qa.answer}`;
    console.log(`📡 Injetando RAG em KnowledgeChunk...`);
    const ragEmbedding = await embeddingService.generateEmbedding(ragContent);
    await repository.saveKnowledgeChunk({
      clientId,
      content: ragContent,
      category,
      embedding: ragEmbedding
    });

    // Gerar variações usando o Gemini 2.5 Flash
    console.log(`🤖 Chamando Gemini 2.5 Flash para gerar 70 variações de Q&A...`);
    const prompt = `
Você é um gerador de dados sintéticos para cache vetorial de atendimento de IA.
Estamos configurando a atendente virtual Keiko para a empresa MW Technology.

Com base na pergunta mestre e na resposta oficial fornecidas abaixo, gere 70 variações de perguntas casuais, curtas, formais, informais ou técnicas que um cliente final poderia fazer sobre este tópico no chat.
Para cada variação, forneça a resposta exata e natural que a Keiko deve dar.

REGRAS CRÍTICAS PARA A RESPOSTA GERADA:
1. Siga estritamente a Persona da Keiko: tom profissional, educado, inteligente, resolutivo. Ela fala no plural em nome da empresa ('nós', 'nosso time', 'nossa equipe').
2. NUNCA utilize nomes próprios nas respostas. Sempre que for citar ou saudar o usuário, use obrigatoriamente a tag {{name}} no lugar do nome. Ex: "Olá, {{name}}!..." ou "Entendo perfeitamente, {{name}}."
3. Se a pergunta demonstrar intenção direta de fechar, orçar ou entrar em contato, adicione ao final da resposta a tag secreta de redirecionamento: [REDIRECT:https://www.moduloweb.com.br/diagnostico]. Mas não force isso em respostas puramente informativas.
4. Mantenha as respostas curtas e diretas, com no máximo 1 a 2 parágrafos breves.

Forneça a saída exclusivamente em um array JSON plano com o seguinte formato, sem formatação markdown extra, apenas o JSON bruto (sem usar blocos \`\`\`json):
[
  {
    "question": "Variação de pergunta 1",
    "response": "Resposta formatada 1"
  },
  ...
]

TÓPICO MESTRE:
Pergunta: "${qa.question}"
Resposta Oficial: "${qa.answer}"
`;

    let variations: { question: string; response: string }[] = [];
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) {
          console.log(`🔁 Tentativa ${attempts + 1}/${maxAttempts} para [Q${qa.id}]...`);
        }
        const response = await model.generateContent(prompt);
        const rawText = response.response.text();
        const cleanedText = cleanJSON(rawText);
        variations = JSON.parse(cleanedText) as { question: string; response: string }[];
        break; // Sucesso, sai do loop de tentativas
      } catch (error: any) {
        attempts++;
        console.warn(`⚠️ Falha ao gerar variações para [Q${qa.id}] na tentativa ${attempts}/${maxAttempts}: ${error.message}`);
        if (attempts >= maxAttempts) {
          console.error(`❌ Limite de tentativas atingido para [Q${qa.id}]. Pulando variações deste item.`);
          break;
        }
        console.log(`⏳ Aguardando 30 segundos antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    if (variations.length > 0) {
      console.log(`✅ Geradas ${variations.length} variações. Iniciando vetorização e ingestão...`);
      try {
        for (const variation of variations) {
          // Salva a variação no cache vetorial Classification
          await repository.saveToDatabase({
            clientId,
            question: variation.question,
            response: variation.response
          });
        }
        console.log(`🎉 Ingestão de variações concluída para [Q${qa.id}]!`);
      } catch (error: any) {
        console.error(`❌ Erro ao salvar variações no banco de dados para [Q${qa.id}]:`, error.message);
      }
    }
    
    // Aguarda 20 segundos para evitar limite de requisições por minuto (RPM) do Gemini Free Tier
    console.log("⏳ Aguardando 20 segundos antes da próxima iteração...");
    await new Promise(resolve => setTimeout(resolve, 20000));
  }

  console.log(`\n=========================================================`);
  console.log("🏆 Processo concluído com sucesso!");
  await prisma.$disconnect();
}

ingestFormCache().catch(console.error);
