import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// --- Schema Definitions (copied from original service) ---
const statSummarySchema = {
    type: Type.OBJECT,
    properties: {
        trades: { type: Type.INTEGER }, pnl: { type: Type.NUMBER }, wins: { type: Type.INTEGER }, losses: { type: Type.INTEGER }, winRate: { type: Type.NUMBER }, avgWin: { type: Type.NUMBER }, avgLoss: { type: Type.NUMBER }, profitFactor: { type: Type.NUMBER },
    },
    required: ["trades", "pnl", "wins", "losses", "winRate", "avgWin", "avgLoss"]
};
const assetStatItemSchema = { type: Type.OBJECT, properties: { key: { type: Type.STRING }, summary: statSummarySchema }, required: ['key', 'summary'] };
const dayOfWeekStatItemSchema = { type: Type.OBJECT, properties: { key: { type: Type.STRING }, summary: statSummarySchema }, required: ['key', 'summary'] };
const hourStatItemSchema = { type: Type.OBJECT, properties: { key: { type: Type.STRING }, summary: statSummarySchema }, required: ['key', 'summary'] };
const monthStatItemSchema = { type: Type.OBJECT, properties: { key: { type: Type.STRING }, summary: statSummarySchema }, required: ['key', 'summary'] };
const weekStatItemSchema = { type: Type.OBJECT, properties: { key: { type: Type.STRING }, summary: statSummarySchema }, required: ['key', 'summary'] };

const tradingStatsSchema = {
    type: Type.OBJECT,
    properties: {
        overall: statSummarySchema,
        byAsset: { type: Type.ARRAY, items: assetStatItemSchema },
        byDayOfWeek: { type: Type.ARRAY, items: dayOfWeekStatItemSchema },
        byHour: { type: Type.ARRAY, items: hourStatItemSchema },
        byMonth: { type: Type.ARRAY, items: monthStatItemSchema },
        byWeek: { type: Type.ARRAY, items: weekStatItemSchema },
        byDirection: { type: Type.OBJECT, properties: { long: statSummarySchema, short: statSummarySchema }, required: ["long", "short"] },
    },
    required: ["overall", "byAsset", "byDayOfWeek", "byHour", "byMonth", "byWeek", "byDirection"]
};
// --- End Schema Definitions ---

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { tradeHistoryContent } = (await req.json()) as { tradeHistoryContent: string };
    const API_KEY = process.env.API_KEY;
    
    if (!API_KEY) {
      console.error("API_KEY environment variable not set on the server.");
      return new Response(JSON.stringify({ details: "Server configuration error: API_KEY is missing." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!tradeHistoryContent) {
        return new Response(JSON.stringify({ details: "Invalid input: 'tradeHistoryContent' is missing." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `
        You are a sophisticated trading performance analyst. Your task is to analyze the provided trading history (CSV, HTML, etc.) and generate a detailed statistical breakdown.
        Identify trades with columns for Symbol, Open Time, Close Time, Direction, and PnL.
        Calculate: Total trades, Net PnL, Wins/Losses, Win Rate (%), Avg Win/Loss PnL, and Profit Factor for each category.
        Provide a complete analysis for: Overall, By Asset, By Day of Week, By Hour (24h), By Month, By Week of Year, and By Direction (long/short).
        Trading data:
        \`\`\`
        ${tradeHistoryContent}
        \`\`\`
        Your response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any explanations.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: tradingStatsSchema,
        }
    });

    const text = response.text;
    if (!text) {
        console.error("Gemini API returned an empty response for stats generation.");
        throw new Error("The AI model returned an empty or invalid response. Cannot generate statistics.");
    }
    
    const parsedStats = JSON.parse(text.trim());
    return new Response(JSON.stringify(parsedStats), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in /api/generate-stats:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ details: `Gemini API call failed: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}