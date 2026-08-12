import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
        const result = await model.embedContent({
            content: { parts: [{text: "Teste de dimensões"}] },
            outputDimensionality: 768
        } as any); // using any in case SDK typing doesn't support it
        console.log(`gemini-embedding-2 (768 requested) dimensões: ${result.embedding.values.length}`);
    } catch (e) {
        console.error(e);
    }
}
run();
