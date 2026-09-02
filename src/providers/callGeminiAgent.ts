import axios from "axios";
import { checkEnvironmentVariable } from "./checkEnvironmentVariable";
import { ChatMemoryRepository } from "../repository/chatMemory.repository";

const chatRepo = new ChatMemoryRepository();

export const callGeminiAgent = async (systemPrompt: string, userPrompt: string, clientId: string, userId: string = "default", saveHistory: boolean = true) => {
  checkEnvironmentVariable();

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  // 1. Busca ou cria o EndUser no banco
  const endUser = await chatRepo.findOrCreateEndUser(clientId, userId, "unknown");

  try {
    // IMPORTANTE: Modelo alterado para 3.5-flash devido ao limite diário do 3.6 e indisponibilidade do 2.5
    const modelName = "gemini-3.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const contents = [];

    // 2. Injeta o histórico recente (apenas se for uma chamada que salva histórico)
    if (saveHistory) {
      const recentHistory = await chatRepo.getRecentMessages(endUser.id, 5);
      for (const msg of recentHistory) {
        contents.push({ role: msg.role, parts: [{ text: msg.content }] });
      }
    }

    // 3. Injeta o prompt atual
    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.7
      }
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const choice = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 4. Salva a interação no histórico longo (Banco de Dados)
    if (choice && saveHistory) {
      await chatRepo.saveMessage(endUser.id, "user", userPrompt);
      await chatRepo.saveMessage(endUser.id, "model", choice);
    }

    return choice;
  } catch (error: any) {
    console.error("Erro ao gerar conteúdo (API Direta):", error.response?.data || error.message);
    throw error;
  }
};