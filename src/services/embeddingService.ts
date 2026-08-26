import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gera o vetor (embedding) para um texto específico usando o modelo oficial text-embedding-004 do Gemini.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("[EmbeddingService] GEMINI_API_KEY não configurada. Retornando vetor zerado para contingência.");
    return new Array(768).fill(0);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    const values = result.embedding.values;

    if (values.length !== 768) {
      console.warn(`[EmbeddingService] Dimensão retornada: ${values.length}. Esperado: 768.`);
      // Se vier com tamanho diferente, ajusta para 768
      if (values.length > 768) return values.slice(0, 768);
      return [...values, ...new Array(768 - values.length).fill(0)];
    }

    return values;
  } catch (error: any) {
    console.error("[EmbeddingService] Erro ao gerar embedding no Gemini:", error.message || error);
    // Tenta fallback com embedding-001
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      const values = result.embedding.values;
      if (values.length === 768) return values;
      if (values.length > 768) return values.slice(0, 768);
      return [...values, ...new Array(768 - values.length).fill(0)];
    } catch (fallbackError: any) {
      console.error("[EmbeddingService] Falha também no fallback de embedding:", fallbackError.message || fallbackError);
      return new Array(768).fill(0);
    }
  }
}

export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    return generateEmbedding(text);
  }
}
