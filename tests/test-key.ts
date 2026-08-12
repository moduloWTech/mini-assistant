import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testKey() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Diga 'Olá Mundo'");
        console.log("Resposta da IA:", result.response.text());
    } catch (error) {
        console.error("Erro ao testar chave:", error);
    }
}

testKey();
