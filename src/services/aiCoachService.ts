import { GoogleGenAI } from "@google/genai";
import { CMJData, Projected1RM, ReadinessData } from "../types";
import { fetchTodayAthletics } from "../api/calendarApi"; 

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AthleteContext {
    name: string;
    sport: string;
    readiness: ReadinessData | null;
    cmj: CMJData | null;
    topLift: Projected1RM | null;
}

// Helper to safely get the key
const getGeminiKey = () => (import.meta as any).env.VITE_GEMINI_API_KEY;

export async function generateDailyInsight(context?: AthleteContext): Promise<string> {
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  try {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    
    // Fetch context (Schedule)
    let scheduleSummary = "Training day.";
    try {
        const schedule = await fetchTodayAthletics();
        if (schedule.length > 0) {
            scheduleSummary = `Events: ${schedule.map(g => g.title).join("; ")}`;
        }
    } catch (e) {
        console.warn("Could not fetch schedule for insight");
    }

    let prompt = `
      You are the head strength coach. Today is ${todayStr}. ${scheduleSummary}.
      Write a single, punchy focus for today (max 25 words).
    `;

    if (context) {
        prompt = `
            Coach for ${context.name} (${context.sport}).
            Data: Readiness ${context.readiness?.score || "?"}/10.
            Give a 2-sentence insight on their status.
        `;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text?.trim() || "Train hard, recover harder.";

  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Consistency is key. Focus on your training goals today.";
  }
}

export async function createCoachSession(): Promise<any> {
    try {
        const apiKey = getGeminiKey();
        if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: 'You are a Performance Coach.' }
        });

        return {
            sendMessage: async (input: { message: string }) => {
                const response = await chat.sendMessage({ message: input.message });
                return { text: response.text };
            }
        };
    } catch (e) {
        console.error(e);
        return {
            sendMessage: async () => ({ text: "Service unavailable (Check API Key)." })
        };
    }
}