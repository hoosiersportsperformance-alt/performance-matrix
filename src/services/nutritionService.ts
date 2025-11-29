import { GoogleGenAI } from "@google/genai";
import { NutritionPlan } from "../types";

export interface NutritionInputs {
  age: string;
  gender: string;
  weight: string;
  height: string;
  activity: string;
  goal: string;
  currentDiet: string;
  notes: string;
}

const getGeminiKey = () => (import.meta as any).env.VITE_GEMINI_API_KEY;

export async function generateNutritionPlan(inputs: NutritionInputs): Promise<NutritionPlan> {
  try {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze diet for ${inputs.age}yo ${inputs.gender}, ${inputs.weight}lbs. Goal: ${inputs.goal}. Diet: ${inputs.currentDiet}. Return JSON with calories, protein, carbs, fats, strengths(array), improvements(array).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response");

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("AI Nutrition Error:", error);
    return {
       calories: 2500,
       protein: 180,
       carbs: 250,
       fats: 80,
       strengths: ["Service unavailable (Check API Key)"],
       improvements: ["Try again later"]
    };
  }
}