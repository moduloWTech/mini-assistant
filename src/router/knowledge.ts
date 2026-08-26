import { Router, Response } from "express";
import multer from "multer";
import { prisma } from "../DB/prisma.config";
import { documentParser } from "../services/parser/documentParser";
import { generateEmbedding } from "../services/embeddingService";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

const knowledgeRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Todas as rotas de conhecimento requerem autenticação
knowledgeRouter.use(authMiddleware);

/**
 * POST /knowledge/upload - Upload de arquivo (PDF, TXT, CSV) para vetorização RAG
 */
knowledgeRouter.post("/upload", upload.single("file"), async (req: AuthRequest, res: Response) => {
  const file = req.file;
  const clientId = req.user?.clientId;
  const category = (req.body.category as string) || "general";

  if (!file || !clientId) {
    return res.status(400).json({ error: "Arquivo e autenticação são obrigatórios." });
  }

  let docSourceId: string | null = null;
  try {
    const fileExt = file.originalname.split(".").pop() || "txt";
    
    // 1. Cria o registro de DocumentSource
    const docSource = await prisma.documentSource.create({
      data: {
        clientId,
        fileName: file.originalname,
        fileType: fileExt,
        fileSize: file.size,
        status: "processing"
      }
    });
    docSourceId = docSource.id;

    // 2. Extrai o texto do arquivo
    const rawText = await documentParser.extractText(file.buffer, fileExt);

    if (!rawText.trim()) {
      await prisma.documentSource.update({
        where: { id: docSourceId },
        data: { status: "error" }
      });
      return res.status(400).json({ error: "O documento não contém texto legível." });
    }

    // 3. Fatiamento, vetorização e salvamento em background
    const chunkCount = await documentParser.ingestDocument(clientId, docSourceId, rawText, category);

    res.status(201).json({
      message: "Documento processado e vetorizado com sucesso.",
      documentId: docSourceId,
      fileName: file.originalname,
      chunksCreated: chunkCount
    });
  } catch (error: any) {
    console.error("[KnowledgeRouter] Erro no upload:", error);
    if (docSourceId) {
      await prisma.documentSource.update({
        where: { id: docSourceId },
        data: { status: "error" }
      }).catch(() => {});
    }
    res.status(500).json({ error: `Erro ao processar documento: ${error.message}` });
  }
});

/**
 * POST /knowledge/url - Ingestão via Web Scraping de URL do cliente
 */
knowledgeRouter.post("/url", async (req: AuthRequest, res: Response) => {
  const { url, category = "faq" } = req.body;
  const clientId = req.user?.clientId;

  if (!url || !clientId) {
    return res.status(400).json({ error: "URL é obrigatória." });
  }

  try {
    const { title, text } = await documentParser.scrapeUrl(url);

    if (!text.trim()) {
      return res.status(400).json({ error: "Não foi possível extrair texto da página informada." });
    }

    const docSource = await prisma.documentSource.create({
      data: {
        clientId,
        fileName: title,
        fileType: "url",
        url: url,
        status: "processing"
      }
    });

    const chunkCount = await documentParser.ingestDocument(clientId, docSource.id, text, category);

    res.status(201).json({
      message: "Página web raspada e vetorizada com sucesso.",
      documentId: docSource.id,
      title,
      chunksCreated: chunkCount
    });
  } catch (error: any) {
    console.error("[KnowledgeRouter] Erro no scrape de URL:", error);
    res.status(500).json({ error: `Erro ao raspar URL: ${error.message}` });
  }
});

/**
 * POST /knowledge/text - Inserção de texto bruto ou FAQ manual
 */
knowledgeRouter.post("/text", async (req: AuthRequest, res: Response) => {
  const { title, content, category = "general" } = req.body;
  const clientId = req.user?.clientId;

  if (!title || !content || !clientId) {
    return res.status(400).json({ error: "Título e conteúdo são obrigatórios." });
  }

  try {
    const docSource = await prisma.documentSource.create({
      data: {
        clientId,
        fileName: title,
        fileType: "txt",
        status: "processing"
      }
    });

    const chunkCount = await documentParser.ingestDocument(clientId, docSource.id, content, category);

    res.status(201).json({
      message: "Texto adicionado à base de conhecimento.",
      documentId: docSource.id,
      chunksCreated: chunkCount
    });
  } catch (error: any) {
    console.error("[KnowledgeRouter] Erro ao salvar texto:", error);
    res.status(500).json({ error: "Erro ao processar texto." });
  }
});

/**
 * GET /knowledge/sources - Listar todos os documentos cadastrados do cliente
 */
knowledgeRouter.get("/sources", async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  try {
    const sources = await prisma.documentSource.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(sources);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

/**
 * DELETE /knowledge/sources/:sourceId - Excluir documento e todos os seus chunks vetoriais
 */
knowledgeRouter.delete("/sources/:sourceId", async (req: AuthRequest, res: Response) => {
  const sourceId = req.params.sourceId as string;
  const clientId = req.user?.clientId;

  try {
    // Deleta os chunks associados primeiro
    await prisma.$executeRawUnsafe(
      `DELETE FROM "KnowledgeChunk" WHERE "documentSourceId" = $1 AND "clientId" = $2`,
      sourceId,
      clientId
    );

    // Deleta o source
    await prisma.documentSource.deleteMany({
      where: { id: sourceId, clientId }
    });

    res.status(200).json({ message: "Documento e vetores excluídos com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir documento." });
  }
});

/**
 * POST /knowledge/playground - Testar busca semântica RAG (Depurador interno)
 */
knowledgeRouter.post("/playground", async (req: AuthRequest, res: Response) => {
  const { query, category, limit = 4 } = req.body;
  const clientId = req.user?.clientId;

  if (!query || !clientId) {
    return res.status(400).json({ error: "Query de teste é obrigatória." });
  }

  try {
    const queryVector = await generateEmbedding(query);
    const vectorString = `[${queryVector.join(",")}]`;

    let results: any[];
    if (category) {
      results = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, content, category, ("embedding" <=> $1::vector) as distance
         FROM "KnowledgeChunk" 
         WHERE "clientId" = $2 AND "category" = $3
         ORDER BY "embedding" <=> $1::vector 
         LIMIT $4`,
        vectorString,
        clientId,
        category,
        limit
      );
    } else {
      results = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, content, category, ("embedding" <=> $1::vector) as distance
         FROM "KnowledgeChunk" 
         WHERE "clientId" = $2
         ORDER BY "embedding" <=> $1::vector 
         LIMIT $3`,
        vectorString,
        clientId,
        limit
      );
    }

    res.status(200).json({
      query,
      matches: results.map((row) => ({
        id: row.id,
        content: row.content,
        category: row.category,
        similarityScore: Math.max(0, (1 - row.distance) * 100).toFixed(1) + "%",
        distance: row.distance
      }))
    });
  } catch (error: any) {
    console.error("[KnowledgeRouter] Erro no playground RAG:", error);
    res.status(500).json({ error: "Erro ao testar busca semântica." });
  }
});

export { knowledgeRouter };
