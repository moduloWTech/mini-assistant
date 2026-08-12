import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function testModel(modelName: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const response = await axios.post(url, {
      contents: [{ role: "user", parts: [{ text: "Oi, me responda com uma palavra" }] }]
    });
    console.log(`✅ Model ${modelName} works! Response:`, response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  } catch (error: any) {
    console.log(`❌ Model ${modelName} failed:`, error.response?.data?.error?.message || error.message);
  }
}

async function testEmbedding(modelName: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${GEMINI_API_KEY}`;
  try {
    const response = await axios.post(url, {
      content: { parts: [{ text: "Teste de embedding" }] }
    });
    console.log(`✅ Embedding ${modelName} works! Output length:`, response.data?.embedding?.values?.length);
  } catch (error: any) {
    console.log(`❌ Embedding ${modelName} failed:`, error.response?.data?.error?.message || error.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.5-flash");
  await testEmbedding("gemini-embedding-2");
}

run();
