import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `You are an AI Athletic Trainer. Provide safe, conservative advice. Do not diagnose.`;

const getGeminiKey = () => (import.meta as any).env.VITE_GEMINI_API_KEY;

export async function createATSession(): Promise<any> {
  try {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return {
      sendMessage: async (input: { message: string }) => {
        const response = await chat.sendMessage({ message: input.message });
        return { text: response.text };
      }
    };
  } catch (error) {
    console.error("AT Service Error:", error);
    return {
      sendMessage: async () => ({ text: "I'm having trouble connecting right now (Check API Key)." })
    };
  }
}