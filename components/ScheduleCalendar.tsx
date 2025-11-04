import React, { useState } from 'react';
import { Schedule, Day, Account, Session } from '../types';
import RefreshIcon from './icons/RefreshIcon';

interface ScheduleCalendarProps {
    schedule: Schedule;
    setSchedule: (schedule: Schedule) => void;
    accounts: Account[];
    accountsMap: Map<string, Account>;
}

const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/**
 * Generates a weekly schedule by alternating active accounts in a round-robin fashion.
 * The number of accounts per session is dynamic: 3 if there are 3 or more active accounts, otherwise 2.
 * @param accounts - The list of all active accounts to be scheduled.
 * @returns A new Schedule object.
 */
const generateLocalSchedule = (accounts: Account[]): Schedule => {
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


const AccountCard: React.FC<{ account: Account }> = ({ account }) => (
    <div className="bg-gray-600 rounded p-2 text-center text-xs w-full animate-fade-in">
        <p className="font-bold text-white truncate">{account.name}</p>
        <p className="text-cyan-300 truncate">{account.company}</p>
        <p className="text-gray-300">${account.size.toLocaleString()}</p>
    </div>
);

const SessionSlot: React.FC<{
    sessionName: string;
    accountIds: string[];
    accountsMap: Map<string, Account>;
}> = ({ sessionName, accountIds, accountsMap }) => {
    return (
        <div className="bg-gray-700/50 p-3 rounded-md min-h-[120px]">
            <h4 className="font-semibold text-sm text-center text-gray-300 mb-2">{sessionName}</h4>
            <div className="space-y-2">
                {accountIds.length > 0 ? (
                    accountIds.map(id => {
                        const account = accountsMap.get(id);
                        return account ? <AccountCard key={id} account={account} /> : null;
                    })
                ) : (
                    <div className="text-center text-gray-500 text-xs pt-4">Empty</div>
                )}
                 {accountIds.length < 2 && <div className="h-[52px]"></div>}
                 {accountIds.length < 1 && <div className="h-[52px]"></div>}
            </div>
        </div>
    );
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedule, setSchedule, accounts, accountsMap }) => {
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = () => {
        if (accounts.length === 0) {
            setError("Please add at least one *active* account to generate the schedule. Pending or suspended accounts are not scheduled.");
            return;
        }
        setError(null);
        const newSchedule = generateLocalSchedule(accounts);
        setSchedule(newSchedule);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Weekly Schedule</h2>
                <button
                    onClick={handleGenerate}
                    className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                    <RefreshIcon />
                    <span className="ml-2">Generate Schedule</span>
                </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {days.map(day => (
                    <div key={day} className="bg-gray-900/50 rounded-lg p-3">
                        <h3 className="font-bold text-center capitalize text-cyan-400 mb-3">{day}</h3>
                        <div className="space-y-3">
                            <SessionSlot sessionName="London" accountIds={schedule[day].london} accountsMap={accountsMap} />
                            <SessionSlot sessionName="New York" accountIds={schedule[day].newYork} accountsMap={accountsMap} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleCalendar;