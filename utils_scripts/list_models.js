const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY não encontrada no ambiente.");
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    
    const models = response.data.models;
    
    console.log("=== MODELOS DE EMBEDDING DISPONÍVEIS ===");
    const embedModels = models.filter(m => m.supportedGenerationMethods.includes("embedContent"));
    embedModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));

    console.log("\n=== MODELOS DE GERAÇÃO DE TEXTO DISPONÍVEIS ===");
    const textModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    textModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));

  } catch (error) {
    console.error("Erro ao listar modelos:", error.response ? error.response.data : error.message);
  }
}

listModels();
