import { GoogleGenAI, Type } from "@google/genai";
import type { Account, Schedule } from '../types';

// This tells Vercel to run this function as an Edge Function for speed.
export const config = {
  runtime: 'edge',
};

// --- Schema Definitions (copied from original service) ---
const daySchema = {
    type: Type.OBJECT,
    properties: {
        london: { type: Type.ARRAY, description: "List of account IDs for the London session. Max 2.", items: { type: Type.STRING } },
        newYork: { type: Type.ARRAY, description: "List of account IDs for the New York session. Max 2.", items: { type: Type.STRING } }
    },
    required: ['london', 'newYork']
};
const scheduleSchema = {
    type: Type.OBJECT,
    properties: {
        monday: daySchema, tuesday: daySchema, wednesday: daySchema, thursday: daySchema, friday: daySchema,
    },
    required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
};
// --- End Schema Definitions ---

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { accounts } = (await req.json()) as { accounts: Account[] };
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      console.error("API_KEY environment variable not set on the server.");
      return new Response(JSON.stringify({ details: "Server configuration error: API_KEY is missing." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!accounts || !Array.isArray(accounts)) {
        return new Response(JSON.stringify({ details: "Invalid input: 'accounts' array is missing or not an array." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';

    const accountsInfo = accounts.map(acc => ({ id: acc.id, name: acc.name, company: acc.company, size: acc.size }));
    
    const prompt = `
        You are an expert logistics and scheduling assistant for a professional proprietary firm trader.
        Your task is to create an optimal weekly trading schedule for the provided list of accounts, following a strict set of rules.
        Rules:
        1.  Schedule runs from Monday to Friday, with two sessions: London and New York.
        2.  A maximum of TWO accounts can be scheduled in any single session.
        3.  Distribute the trading workload as evenly as possible throughout the week.
        4.  Ensure every single account is scheduled at least once before scheduling any account for a second time.
        5.  After every account has been scheduled once, fill remaining empty slots to maintain even distribution.
        Accounts to schedule:
        ${JSON.stringify(accountsInfo, null, 2)}
        Generate the full 5-day schedule. Your response MUST be a valid JSON object that adheres to the provided schema. Do not include any text or markdown formatting.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: scheduleSchema
        }
    });

    const text = response.text;
    if (!text) {
        console.error("Gemini API returned an empty response for schedule optimization.");
        throw new Error("The AI model returned an empty or invalid response. Cannot generate schedule.");
    }
    
    const parsedSchedule = JSON.parse(text.trim());
    
    return new Response(JSON.stringify(parsedSchedule), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in /api/optimize-schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ details: `Gemini API call failed: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}