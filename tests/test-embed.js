require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function run() {
  try {
    const models = ["gemini-embedding-001", "gemini-embedding-2"];
    for (const m of models) {
        try {
            console.log("Testing:", m);
            const model = genAI.getGenerativeModel({ model: m });
            const res = await model.embedContent("Hello");
            console.log("SUCCESS:", m, "length:", res.embedding.values.length);
        } catch(e) { console.log("FAIL:", m, e.message.split('\n')[0]); }
    }
  } catch(e) { console.error(e.message); }
}
run();
