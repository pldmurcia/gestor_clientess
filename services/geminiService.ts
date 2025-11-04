

import { GoogleGenAI, Type } from "@google/genai";
import { Account, Schedule, TradingStats } from '../types';

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

const statSummarySchema = {
    type: Type.OBJECT,
    properties: {
        trades: { type: Type.INTEGER, description: "Total number of trades." },
        pnl: { type: Type.NUMBER, description: "Net Profit and Loss." },
        wins: { type: Type.INTEGER, description: "Number of winning trades." },
        losses: { type: Type.INTEGER, description: "Number of losing trades." },
        winRate: { type: Type.NUMBER, description: "Percentage of winning trades (0 to 100)." },
        avgWin: { type: Type.NUMBER, description: "Average PnL of winning trades." },
        avgLoss: { type: Type.NUMBER, description: "Average PnL of losing trades (as a negative number)." },
        profitFactor: { type: Type.NUMBER, description: "Gross profit divided by gross loss. Null if no losses." },
    },
    required: ["trades", "pnl", "wins", "losses", "winRate", "avgWin", "avgLoss"]
};

const assetStatItemSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "The trading symbol/asset (e.g., 'EURUSD')." },
        summary: statSummarySchema,
    },
    required: ['key', 'summary'],
};
const dayOfWeekStatItemSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "The day of the week (e.g., 'Monday')." },
        summary: statSummarySchema,
    },
    required: ['key', 'summary'],
};
const hourStatItemSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "The hour of the day in 24-hour format (e.g., '09')." },
        summary: statSummarySchema,
    },
    required: ['key', 'summary'],
};
const monthStatItemSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "The month name (e.g., 'January')." },
        summary: statSummarySchema,
    },
    required: ['key', 'summary'],
};
const weekStatItemSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "The week of the year (e.g., 'Week 30')." },
        summary: statSummarySchema,
    },
    required: ['key', 'summary'],
};


const tradingStatsSchema = {
    type: Type.OBJECT,
    properties: {
        overall: statSummarySchema,
        byAsset: {
            type: Type.ARRAY,
            description: "An array of statistics for each trading symbol/asset.",
            items: assetStatItemSchema,
        },
        byDayOfWeek: {
            type: Type.ARRAY,
            description: "An array of statistics for each day of the week.",
            items: dayOfWeekStatItemSchema,
        },
        byHour: {
            type: Type.ARRAY,
            description: "An array of statistics for each hour of the day.",
            items: hourStatItemSchema,
        },
        byMonth: {
            type: Type.ARRAY,
            description: "An array of statistics for each month.",
            items: monthStatItemSchema,
        },
         byWeek: {
            type: Type.ARRAY,
            description: "An array of statistics for each week number of the year.",
            items: weekStatItemSchema,
        },
        byDirection: {
            type: Type.OBJECT,
            properties: {
                long: statSummarySchema,
                short: statSummarySchema,
            },
            required: ["long", "short"]
        },
    },
    required: ["overall", "byAsset", "byDayOfWeek", "byHour", "byMonth", "byWeek", "byDirection"]
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

export const generateTradingStats = async (tradeHistoryContent: string): Promise<TradingStats> => {
     const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `
        You are a sophisticated trading performance analyst. Your task is to analyze the provided trading history and generate a detailed statistical breakdown. The data provided is the text content of a user-uploaded file, which could be in CSV, HTML, or a text representation of an Excel sheet.

        Please parse this data to identify trades. Look for columns that represent: Symbol, Open Time, Close Time, Direction, and PnL. The column order might vary, and the data could be comma-separated, tab-separated, or within HTML table tags.
        - "Direction" will be 'long' or 'short'.
        - "PnL" is a numerical value representing profit or loss.
        - "Open Time" is a timestamp (e.g., "2024-07-29 09:35:00") from which you must extract the hour, day of the week, week of the year, and month for analysis.

        Analyze the data and calculate the following metrics for each category:
        - Total number of trades.
        - Net PnL.
        - Number of wins and losses.
        - Win Rate (as a percentage).
        - Average Win PnL and Average Loss PnL.
        - Profit Factor (total profit from winners / absolute total loss from losers). If there are no losses, profit factor should be null.

        Provide a complete analysis covering:
        1.  Overall performance.
        2.  Performance by each unique asset (Symbol), as an array of objects.
        3.  Performance by day of the week (e.g., 'Monday', 'Tuesday'), as an array of objects.
        4.  Performance by hour of the day (24-hour format, e.g., '09', '15'), as an array of objects.
        5.  Performance by month (e.g., 'January', 'July'), as an array of objects.
        6.  Performance by week of the year (e.g., 'Week 1', 'Week 30'), as an array of objects.
        7.  Performance by trade direction ('long' and 'short').

        For the array-based statistics (byAsset, byDayOfWeek, etc.), each object in the array should have a "key" (e.g., the asset name 'EURUSD' or the day 'Monday') and a "summary" object containing the calculated metrics.

        Here is the trading data:
        \`\`\`
        ${tradeHistoryContent}
        \`\`\`

        Your response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, explanations, or markdown formatting before or after the JSON object.
    `;

     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: tradingStatsSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TradingStats;

    } catch (error) {
        console.error("Error calling Gemini API for stats generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate stats via Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating statistics.");
    }
};