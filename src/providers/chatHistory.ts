import { ChatEntry } from "../types";

export class ChatHistory {
    limit: number;
    histories: ChatEntry[];

    constructor(limit = 5) {
        this.limit = limit;
        this.histories = [];
    }

    addHistory(question: string, answer: string) {
        this.histories.push({ question, answer });

        if (this.histories.length > this.limit) {
            this.histories.shift();
        }
    }

    getRecentQuestionsAndAnswers() {
        return this.histories;
    }
}
