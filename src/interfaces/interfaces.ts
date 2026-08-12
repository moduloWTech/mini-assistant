import { Classification } from "@prisma/client";

// Interface para salvar logs de classificação e resposta no banco (Cache/Histórico)
export interface ISaveToDatabase {
    clientId: string;
    question: string;
    response: string;
}

// Interface para busca de perguntas similares no cache
export interface IFindSimilarQuestion {
    clientId: string;
    question: string;
}

// --- Interfaces para o Sistema RAG (Busca Vetorial) ---

// Categoria permitida para o conhecimento (alinhada com os Agentes)
export type KnowledgeCategory = 'history' | 'pricing' | 'services' | 'contact' | 'smalltalk' | 'memory';

// Interface para a requisição de criação de conhecimento vinda do frontend
export interface ICreateKnowledgeRequest {
    clientId: string;
    content: string; // O texto bruto que o cliente quer que a IA saiba
    category: KnowledgeCategory;
}

// Interface para o processamento interno de fragmentos de conhecimento (Chunks)
export interface IKnowledgeChunkData {
    clientId: string;
    content: string;
    category: string;
    embedding: number[]; // O vetor (lista de números) gerado pela IA
}

// --- Definição do Repositório de Métodos ---

export interface IMethodsRepository {
    // Métodos de cache e logs (Legado/Suporte)
    saveToDatabase(data: ISaveToDatabase): Promise<Classification>;
    findSimilarQuestion(data: IFindSimilarQuestion): Promise<Classification | null>;
    
    // Novos métodos para o sistema RAG
    saveKnowledgeChunk(data: IKnowledgeChunkData): Promise<void>;
    
    /**
     * Busca parágrafos relevantes no banco usando busca semântica (vetorial)
     * @param queryVector O vetor da pergunta do usuário
     * @param clientId O ID do cliente (isolamento de dados)
     * @param category A categoria do assunto (filtro de prateleira)
     * @param limit Quantidade máxima de parágrafos a retornar
     */
    findRelevantKnowledge(
        queryVector: number[], 
        clientId: string, 
        category: string, 
        limit: number
    ): Promise<string[]>;
}