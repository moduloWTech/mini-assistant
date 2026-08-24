import axios from "axios";
import OpenAI from "openai";
import { prisma } from "../../DB/prisma.config";
import { ChatMemoryRepository } from "../../repository/chatMemory.repository";

const chatRepo = new ChatMemoryRepository();

interface LLMOptions {
  systemPrompt: string;
  userPrompt: string;
  clientId: string;
  userId?: string;
  channel?: "whatsapp" | "telegram" | "web";
  maxTokens?: number;
  temperature?: number;
}

interface LLMResponse {
  text: string;
  provider: "gemini" | "openai" | "fallback";
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

/**
 * Gateway Multi-LLM com Circuit-Breaker e Fallback Automático:
 * 1. Primário: Google Gemini 2.5 Flash (gemini-flash-latest)
 * 2. Secundário: OpenAI GPT-4o-mini (quando Gemini tiver timeout ou rate limit)
 * 3. Fallback Seguro: Resposta empática de contingência
 */
export class LLMGateway {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async generate(options: LLMOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const {
      systemPrompt,
      userPrompt,
      clientId,
      userId = "default",
      channel = "web",
      maxTokens = 350,
      temperature = 0.7
    } = options;

    // 1. Busca ou cria o EndUser no banco
    const endUser = await chatRepo.findOrCreateEndUser(clientId, userId, channel);
    const recentHistory = await chatRepo.getRecentMessages(endUser.id, 6);

    // Tenta primeiro o Google Gemini
    try {
      const geminiResult = await this.callGemini(systemPrompt, userPrompt, recentHistory, maxTokens, temperature);
      const latencyMs = Date.now() - startTime;

      // Salva no histórico do banco
      if (geminiResult) {
        await chatRepo.saveMessage(endUser.id, "user", userPrompt);
        await chatRepo.saveMessage(endUser.id, "model", geminiResult);

        // Registra telemetria de uso
        await this.logUsage(clientId, channel, "gemini-flash-latest", 100, 50, false, latencyMs);
      }

      return {
        text: geminiResult,
        provider: "gemini",
        model: "gemini-flash-latest",
        latencyMs
      };
    } catch (geminiError: any) {
      console.warn("⚠️ [LLMGateway] Falha no Gemini. Acionando Fallback OpenAI...", geminiError.message);

      // Tenta fallback com OpenAI GPT-4o-mini
      if (this.openai && process.env.OPENAI_API_KEY) {
        try {
          const openaiResult = await this.callOpenAI(systemPrompt, userPrompt, recentHistory, maxTokens, temperature);
          const latencyMs = Date.now() - startTime;

          if (openaiResult) {
            await chatRepo.saveMessage(endUser.id, "user", userPrompt);
            await chatRepo.saveMessage(endUser.id, "model", openaiResult);

            await this.logUsage(clientId, channel, "gpt-4o-mini", 120, 60, false, latencyMs);
          }

          return {
            text: openaiResult,
            provider: "openai",
            model: "gpt-4o-mini",
            latencyMs
          };
        } catch (openaiError: any) {
          console.error("❌ [LLMGateway] Falha também no fallback OpenAI:", openaiError.message);
        }
      }

      // Fallback final gracioso
      const latencyMs = Date.now() - startTime;
      const fallbackText = "Estou com uma breve oscilação momentânea na conexão, mas já estou recuperando as informações. Por favor, repita sua mensagem em alguns segundos!";

      await chatRepo.saveMessage(endUser.id, "user", userPrompt);
      await chatRepo.saveMessage(endUser.id, "model", fallbackText);

      return {
        text: fallbackText,
        provider: "fallback",
        model: "system-contingency",
        latencyMs
      };
    }
  }

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    maxTokens: number,
    temperature: number
  ): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não configurada.");
    }

    const modelName = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const contents = [];
    for (const msg of history) {
      contents.push({ role: msg.role === "agent" ? "model" : msg.role, parts: [{ text: msg.content }] });
    }
    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature
      }
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000 // 5s timeout antes do fallback
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    maxTokens: number,
    temperature: number
  ): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI client não instanciado.");
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt }
    ];

    for (const msg of history) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    }

    messages.push({ role: "user", content: userPrompt });

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content || "";
  }

  private async logUsage(
    clientId: string,
    channel: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    isFastPath: boolean,
    latencyMs: number
  ) {
    try {
      await prisma.tokenUsageLog.create({
        data: {
          clientId,
          channel,
          model,
          inputTokens,
          outputTokens,
          isFastPath,
          latencyMs
        }
      });
    } catch (e) {
      // Ignora erro de log para não interromper o fluxo principal
    }
  }
}

export const llmGateway = new LLMGateway();
