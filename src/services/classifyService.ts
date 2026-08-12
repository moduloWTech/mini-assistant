import { cachedClassifications } from "./cachedClassifications";
import { callGeminiAgent } from "./callGeminiAgent";

export const classifyTask = async (task: string, clientId: string): Promise<string> => {
  const prompt = `
    Classifique a mensagem a seguir com apenas uma palavra, escolhendo entre: history, services, memory, smalltalk, pricing, contacts, other.
  `;

  
  try {
    const cached = cachedClassifications(task);
    if (cached) return cached;

    const systemPrompt = 'Você é um classificador de tarefas. Responda apenas com a categoria.';
    const userPrompt = `${prompt}\n\nMensagem a classificar: "${task}"`;

    const category = await callGeminiAgent(systemPrompt, userPrompt, clientId);

    if (!category) {
      return 'other';
    }


    const validCategories = ['history', 'services', 'memory', 'smalltalk', 'pricing', 'contacts', 'other'];

    if (!validCategories.includes(category.toLowerCase())) {
      return 'other';
    };

    return category.toLowerCase();
  } catch (error) {
    console.error("Erro no classificador:", error);
    return 'other';
  }
};