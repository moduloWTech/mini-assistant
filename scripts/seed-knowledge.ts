import { MethodsRepository } from "../src/repository/methods.repository";
import { EmbeddingService } from "../src/services/embeddingService";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const repository = new MethodsRepository();
const embeddingService = new EmbeddingService();

async function seedKnowledge() {
  const clientEmail = "contato.moduloweb@gmail.com";
  
  const client = await prisma.client.findUnique({
    where: { email: clientEmail }
  });

  if (!client) {
    console.error("❌ Cliente não encontrado. Rode 'npm run setup:client' primeiro.");
    return;
  }

  const clientId = client.id;

  // 2. Conhecimento Real da MW Technology
  const knowledge = [
    {
      category: "history",
      content: "MW Technology (ex-Módulo Web): Fundada em 19 de janeiro de 2026 por Cláudio Soares. A agência nasceu da necessidade de criar sistemas de vendas online de alta performance, unindo expertise técnica com foco em geração de receita e escala comercial."
    },
    {
      category: "history",
      content: "Missão da MW Technology: 'Engenharia que dá vida à sua visão.' Transformamos ideias complexas em ferramentas digitais lucrativas e automatizadas, focando em autonomia tecnológica e alta performance."
    },
    {
      category: "history",
      content: "Valores da MW Technology: Autonomia tecnológica (evitamos soluções limitadas como WordPress), segurança de dados, transparência no tráfego e uso de stacks modernas como React, Node.js e Supabase."
    },
    {
      category: "services",
      content: "Serviços de Desenvolvimento Web de Elite: Criamos Landing Pages de alta conversão, Dashboards administrativos personalizados e plataformas SaaS completas sob medida."
    },
    {
      category: "services",
      content: "Engenharia de Software e Automação: Construção de APIs robustas, integrações complexas (ecossistema Meta/WhatsApp Cloud API) e implementação de LLMs para atendimento automatizado."
    },
    {
      category: "services",
      content: "Ecossistemas de Venda e Performance: Criação de catálogos digitais dinâmicos, checkouts integrados e gestão de tráfego pago (Meta Ads e Google Ads) focada em ROI e leads qualificados."
    },
    {
      category: "pricing",
      content: "Política de Preços: Trabalhamos com projetos personalizados. Landing Pages e Dashboards de entrada partem de um investimento base, mas o valor final depende da complexidade. O ideal é agendar um diagnóstico rápido."
    },
    {
      category: "pricing",
      content: "Solicitação de Orçamento: Para receber uma proposta de escopo em até 24h, o cliente deve solicitar um orçamento personalizado via formulário ou WhatsApp direto."
    },
    {
      category: "contacts",
      content: "Contatos Oficiais: Site (https://www.moduloweb.com.br/), E-mail (contato.moduloweb@gmail.com), WhatsApp Business (+55 98 98506-6966), Instagram (https://www.instagram.com/modulo_web_/). Cláudio Soares é o fundador."
    }
  ];

  console.log(`🚀 Alimentando cérebro da Keiko para: ${client.name}...`);

  try {
    // Limpa conhecimento antigo antes de inserir o novo (opcional, mas bom para evitar duplicidade)
    await prisma.knowledgeChunk.deleteMany({ where: { clientId } });

    for (const item of knowledge) {
      console.log(`📡 Vetorizando: "${item.content.substring(0, 50)}..."`);
      const embedding = await embeddingService.generateEmbedding(item.content);
      
      await repository.saveKnowledgeChunk({
        clientId: clientId,
        content: item.content,
        category: item.category,
        embedding: embedding
      });
    }

    console.log("✅ Conhecimento real da MW Technology injetado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao alimentar conhecimento:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedKnowledge();
