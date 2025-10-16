
import { GoogleGenAI, Type } from "@google/genai";
import { Account, Schedule } from '../types';

const daySchema = {
    type: Type.OBJECT,
    properties: {
        london: {
            type: Type.ARRAY,
            description: "List of account IDs for the London session. Max 2.",
            items: { type: Type.STRING }
        },
        newYork: {
            type: Type.ARRAY,
            description: "List of account IDs for the New York session. Max 2.",
            items: { type: Type.STRING }
        }
    },
    required: ['london', 'newYork']
};

const scheduleSchema = {
    type: Type.OBJECT,
    properties: {
        monday: daySchema,
        tuesday: daySchema,
        wednesday: daySchema,
        thursday: daySchema,
        friday: daySchema,
    },
    required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
};


export const optimizeSchedule = async (accounts: Account[]): Promise<Schedule> => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set. Please ensure it's configured before using AI features.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';

    const accountsInfo = accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        company: acc.company,
        size: acc.size
    }));
    
    const prompt = `
        You are an expert logistics and scheduling assistant for a professional proprietary firm trader.
        Your task is to create an optimal weekly trading schedule for the provided list of accounts, following a strict set of rules.

        Trader's Rules:
        1.  The schedule runs from Monday to Friday.
        2.  Each day has two sessions: London and New York.
        3.  A maximum of TWO accounts can be scheduled in any single session. This is a hard limit.
        4.  The primary goal is to distribute the trading workload as evenly as possible throughout the week. Avoid leaving sessions empty if there are accounts available to be scheduled.
        5.  First, ensure every single account from the list is scheduled at least once during the week.
        6.  After every account has been scheduled once, if there are still empty slots in the schedule, continue to fill them by scheduling accounts for a second, third, or subsequent time.
        7.  When re-scheduling accounts, continue to prioritize an even distribution of workload across all sessions and days.
        8.  If there are more accounts than available slots in the week (20 total slots), it's acceptable that some accounts may not be scheduled. However, given the list, you should be able to schedule all of them.

        Here is the list of trading accounts to be scheduled:
        ${JSON.stringify(accountsInfo, null, 2)}

        Generate the full 5-day schedule. Your response MUST be a valid JSON object that adheres to the provided schema. Do not include any text, explanations, or markdown formatting before or after the JSON object. The JSON must be complete and well-formed.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scheduleSchema
            }
        });

        const jsonText = response.text.trim();
        const parsedSchedule = JSON.parse(jsonText) as Schedule;
        
        // Basic validation
        if (typeof parsedSchedule.monday?.london === 'undefined') {
            throw new Error("Invalid schedule format received from AI.");
        }
        
        return parsedSchedule;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate schedule via Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the schedule.");
    }
};
