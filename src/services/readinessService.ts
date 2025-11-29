import { GoogleGenAI } from "@google/genai";
import { WellnessInputs, AIReadinessResult } from "../types";

const getGeminiKey = () => (import.meta as any).env.VITE_GEMINI_API_KEY;

export async function generateAIReadiness(
  input: WellnessInputs, 
  context: { consistency: number; cmjTrend7: number; volumeTrend7: number }
): Promise<AIReadinessResult> {
  try {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Calculate readiness score (0-100) for athlete. Sleep: ${input.sleepHours}, Soreness: ${input.soreness}. Return JSON: readinessScore, color (Green/Yellow/Red), insight, coachNote.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return {
        ...JSON.parse(text),
        timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("AI Readiness Error:", error);
    return {
        readinessScore: 75,
        color: "Yellow",
        insight: "Service unavailable (Check API Key).",
        coachNote: "System error.",
        timestamp: new Date().toISOString()
    };
  }
}