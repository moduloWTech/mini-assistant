import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
console.log("API KEY (primeiros 5 chars):", GEMINI_API_KEY.substring(0, 5));
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function listModels() {
    try {
        const response = await genAI.models.list();
        console.log("Modelos disponíveis:");
        response.models?.forEach(m => {
            console.log(`- ${m.name} (Suporta: ${m.supportedMethods?.join(", ")})`);
        });
    } catch (error) {
        console.error("Erro ao listar modelos:", error);
    }
}

listModels();
