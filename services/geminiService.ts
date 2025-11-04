import { Account, Schedule, TradingStats } from '../types';

export const optimizeSchedule = async (accounts: Account[]): Promise<Schedule> => {
    try {
        const response = await fetch('/api/optimize-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accounts }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ details: 'Failed to parse error response from server.' }));
            console.error('Server error:', errorData);
            throw new Error(errorData.details || 'The server returned an error.');
        }

        const schedule = await response.json();
        return schedule;

    } catch (error) {
        console.error("Error calling /api/optimize-schedule endpoint:", error);
        if (error instanceof Error) {
            // Re-throw with a user-friendly message
            throw new Error(`Could not generate schedule. A network or server error occurred: ${error.message}`);
        }
        throw new Error("An unknown error occurred while optimizing the schedule.");
    }
};

export const generateTradingStats = async (tradeHistoryContent: string): Promise<TradingStats> => {
    try {
        const response = await fetch('/api/generate-stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tradeHistoryContent }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ details: 'Failed to parse error response from server.' }));
            console.error('Server error:', errorData);
            throw new Error(errorData.details || 'The server returned an error during statistics generation.');
        }
        
        const stats = await response.json();
        return stats;

    } catch (error) {
        console.error("Error calling /api/generate-stats endpoint:", error);
         if (error instanceof Error) {
            throw new Error(`Could not generate stats. A network or server error occurred: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating statistics.");
    }
};
