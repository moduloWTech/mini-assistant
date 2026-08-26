import * as cheerio from "cheerio";
import axios from "axios";
import { generateEmbedding } from "../embeddingService";
import { prisma } from "../../DB/prisma.config";

export class DocumentParser {
  /**
   * Extrai texto bruto de um buffer com base no tipo de arquivo.
   */
  async extractText(buffer: Buffer, fileType: string): Promise<string> {
    let rawText = "";
    switch (fileType.toLowerCase()) {
      case "pdf":
        rawText = await this.extractFromPdf(buffer);
        break;
      case "txt":
      case "csv":
      default:
        rawText = buffer.toString("utf-8");
        break;
    }
    // Remove null bytes (\u0000) that crash PostgreSQL UTF8 encoding
    return rawText.replace(/\0/g, '');
  }

  /**
   * Extrai texto de um PDF usando pdf-parse.
   */
  private async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const pdf = require("pdf-parse");
      const parseFunc = typeof pdf === "function" ? pdf : pdf.PDFParse || pdf.default;
      const data = await parseFunc(buffer);
      return data.text || "";
    } catch (error: any) {
      console.error("[DocumentParser] Erro ao processar PDF:", error);
      throw new Error(`Falha ao ler arquivo PDF: ${error.message}`);
    }
  }

  /**
   * Extrai o conteúdo textual de uma URL pública via Web Scraping.
   */
  async scrapeUrl(url: string): Promise<{ title: string; text: string }> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Remove tags irrelevantes
      $("script, style, noscript, iframe, nav, footer, header, svg").remove();

      const title = $("title").text().trim() || url;
      
      // Coleta o texto dos elementos semânticos principais
      const bodyText = $("body").text()
        .replace(/\s+/g, " ")
        .replace(/\n+/g, "\n")
        .trim();

      return { title, text: bodyText };
    } catch (error: any) {
      console.error("[DocumentParser] Erro ao raspar URL:", error);
      throw new Error(`Falha ao acessar URL: ${error.message}`);
    }
  }

  /**
   * Divide o texto em pedaços (chunks) preservando parágrafos e pontuação.
   */
  chunkText(text: string, chunkSize: number = 800, overlap: number = 100): string[] {
    const cleanText = text.replace(/\r\n/g, "\n").trim();
    if (!cleanText) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + chunkSize;
      
      if (end < cleanText.length) {
        // Tenta quebrar no ponto final, interrogação ou nova linha mais próxima
        const nextBreak = cleanText.substring(start, end + 50).lastIndexOf("\n");
        const nextPeriod = cleanText.substring(start, end + 50).lastIndexOf(". ");

        if (nextBreak > chunkSize * 0.7) {
          end = start + nextBreak;
        } else if (nextPeriod > chunkSize * 0.7) {
          end = start + nextPeriod + 1;
        }
      }

      const chunk = cleanText.substring(start, end).trim();
      if (chunk.length > 30) { // Ignora fragmentos minúsculos
        chunks.push(chunk);
      }

      start = end - overlap;
      if (start >= cleanText.length - overlap) break;
    }

    return chunks;
  }

  /**
   * Processa, divide em chunks, vetoriza e persiste os dados associando ao DocumentSource.
   */
  async ingestDocument(
    clientId: string,
    documentSourceId: string,
    rawText: string,
    category: string = "general"
  ): Promise<number> {
    const chunks = this.chunkText(rawText);
    console.log(`[DocumentParser] Ingerindo ${chunks.length} chunks para o documento ${documentSourceId}...`);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      const vectorString = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "KnowledgeChunk" ("id", "content", "category", "clientId", "documentSourceId", "embedding", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::vector, NOW(), NOW())`,
        chunk,
        category,
        clientId,
        documentSourceId,
        vectorString
      );
    }

    // Atualiza status e contagem de chunks no DocumentSource
    await prisma.documentSource.update({
      where: { id: documentSourceId },
      data: {
        status: "processed",
        chunkCount: chunks.length
      }
    });

    return chunks.length;
  }
}

export const documentParser = new DocumentParser();
