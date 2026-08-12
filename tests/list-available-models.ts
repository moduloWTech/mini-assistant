import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function listAllModels() {
    if (!GEMINI_API_KEY) {
        console.error("ERRO: GEMINI_API_KEY não encontrada no arquivo .env");
        return;
    }

    console.log("--- Iniciando consulta de modelos disponíveis ---");
    console.log(`Usando chave: ${GEMINI_API_KEY.substring(0, 5)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        // Na versão atual do SDK, o acesso a modelos pode ser feito via fetch direto
        // ou verificando se o método existe sob outras propriedades.
        // Vamos tentar a rota da API REST que é garantida.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const result = await response.json() as any;
        
        if (result.error) {
            throw new Error(`${result.error.code} - ${result.error.message}`);
        }

        console.log("\nModelos que sua chave permite usar:");
        console.log("--------------------------------------------------");

        result.models.forEach((model: any) => {
            console.log(`\n🤖 Nome: ${model.name}`);
            console.log(`   Exibição: ${model.displayName}`);
            console.log(`   Métodos Suportados: ${model.supportedGenerationMethods.join(", ")}`);
        });

        console.log("\n--------------------------------------------------");
        console.log("--- Consulta finalizada com sucesso ---");
    } catch (error) {
        console.error("\n❌ Erro ao listar modelos:");
        if (error instanceof Error) {
            console.error(`   Mensagem: ${error.message}`);
        } else {
            console.error(`   Detalhes: ${JSON.stringify(error)}`);
        }
    }
}

listAllModels();
