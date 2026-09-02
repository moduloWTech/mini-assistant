import { ChatEntry } from "../types";

export const recentQuestionsAndAnswers = (recentHistory: ChatEntry[]) => {

    const recentQuestionsAndAnswers = recentHistory.map((entry: { question: string, answer: string }) => {
        return `Q: ${entry.question}\nA: ${entry.answer}\n`;
    }).join("\n");

    return {recentQuestionsAndAnswers}
}

