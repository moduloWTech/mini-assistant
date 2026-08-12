import { Category } from "../types";

export const cachedClassifications = (task: string): Category | undefined => {
    const normalizedTask = task.toLowerCase().trim();

    // 1. Dicionário de Match Exato (Mantendo e expandindo o que já funcionava)
    const exactMatches: Record<string, Category> = {
        "quanto custa?": "pricing",
        "quanto custa": "pricing",
        "vocês têm whatsapp?": "contacts",
        "voces tem whatsapp": "contacts",
        "oi": "smalltalk",
        "olá": "smalltalk",
        "ola": "smalltalk",
        "quero agendar uma reunião": "contacts",
        "qual experiência da empresa?": "history"
    };

    if (exactMatches[normalizedTask]) {
        return exactMatches[normalizedTask];
    }

    // 2. Filtro rápido para palavras curtas muito comuns em chat
    if (normalizedTask.length <= 4 && ["sim", "não", "nao", "ok", "bom", "top"].includes(normalizedTask)) {
        return "smalltalk";
    }

    // 3. Regex para pegar a intenção mesmo se a frase for longa ou diferente
    if (/custa|preço|preco|valor|planos|pagar/i.test(normalizedTask)) {
        return "pricing";
    }

    if (/whatsapp|telefone|contato|reunião|reuniao|agendar/i.test(normalizedTask)) {
        return "contacts";
    }

    if (/experiência|experiencia|história|historia|sobre a empresa/i.test(normalizedTask)) {
        return "history";
    }

    if (/obrigado|valeu|bom dia|boa tarde|boa noite|tchau/i.test(normalizedTask)) {
        return "smalltalk";
    }

    // Se nenhuma regra bater, retorna undefined e a LLM assume o trabalho
    return undefined;
}