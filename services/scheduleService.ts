import { Schedule, Day, Account, Session } from '../types';

const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/**
 * Generates a weekly schedule by alternating active accounts in a round-robin fashion.
 * The number of accounts per session is dynamic: 3 if there are 3 or more active accounts, otherwise 2.
 * It intentionally leaves Friday's New York session empty.
 * @param accounts - The list of all active accounts to be scheduled.
 * @returns A new Schedule object.
 */
export const generateLocalSchedule = (accounts: Account[]): Schedule => {
    const newSchedule: Schedule = {
        monday: { london: [], newYork: [] },
        tuesday: { london: [], newYork: [] },
        wednesday: { london: [], newYork: [] },
        thursday: { london: [], newYork: [] },
        friday: { london: [], newYork: [] },
    };

    if (accounts.length === 0) {
        return newSchedule;
    }

    const maxAccountsPerSession = accounts.length >= 3 ? 3 : 2;
    const accountIds = accounts.map(acc => acc.id);
    let accountIndex = 0;
    const sessions: Session[] = ['london', 'newYork'];

    // Iterate through days and sessions to fill the slots sequentially.
    for (const day of days) {
        for (const session of sessions) {
            // Skip Friday's New York session to leave it blank.
            if (day === 'friday' && session === 'newYork') {
                continue;
            }

            // Add up to `maxAccountsPerSession` accounts per session.
            for (let i = 0; i < maxAccountsPerSession; i++) {
                 // Stop adding to this session if we have fewer unique accounts than the loop count.
                 if (i >= accountIds.length) break;

                 newSchedule[day][session].push(accountIds[accountIndex]);
                 accountIndex = (accountIndex + 1) % accountIds.length;
            }
        }
    }
    return newSchedule;
};