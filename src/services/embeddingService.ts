import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeCategory } from "../interfaces/interfaces";
import { MethodsRepository } from "../repository/methods.repository";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


/**
 * Gera o vetor (embedding) para um texto específico usando o Gemini.
 * Extraído da classe para evitar dependência circular com Repositories.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent({
            content: { parts: [{ text }] },
            outputDimensionality: 768
        } as any);
        const values = result.embedding.values;
        
        // Log de segurança para depuração
        if (values.length !== 768) {
            console.warn(`[EmbeddingService] Dimensão inesperada: ${values.length}. Esperado: 768`);
        }
        
        return values;
    } catch (error) {
        console.error("Erro ao gerar embedding no Gemini:", error);
        throw new Error("Falha na vetorização do texto.");
    }
}

/**
 * Serviço responsável por transformar texto em vetores (Embeddings)
 * e gerenciar a ingestão de conhecimento no banco de dados.
 */
export class EmbeddingService {
    
    /**
     * @deprecated Use a função exportada `generateEmbedding` diretamente.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        return generateEmbedding(text);
    }

    /**
     * Divide um texto longo em pedaços menores (chunks) para melhor processamento da IA.
     * @param text Texto completo.
     * @param maxLength Tamanho máximo de cada pedaço (padrão 1000 caracteres).
     */
    private splitText(text: string, maxLength: number = 1000): string[] {
        // Lógica simples de fatiamento por parágrafos ou tamanho
        const chunks: string[] = [];
        let currentPos = 0;

        while (currentPos < text.length) {
            let chunk = text.substring(currentPos, currentPos + maxLength);
            chunks.push(chunk);
            currentPos += maxLength;
        }
        return chunks;
    }

    /**
     * Processa um novo conhecimento: fatia, vetoriza e salva no banco.
     * @param content Texto bruto enviado pelo cliente.
     * @param category Categoria do assunto (history, pricing, etc).
     * @param clientId ID do cliente (Tenant).
     */
    async processAndSaveKnowledge(content: string, category: KnowledgeCategory, clientId: string): Promise<void> {
        const repo = new MethodsRepository();
        const chunks = this.splitText(content);

        for (const chunk of chunks) {
            const embedding = await this.generateEmbedding(chunk);
            
            await repo.saveKnowledgeChunk({
                clientId,
                content: chunk,
                category,
                embedding
            });
        }
    }
}
