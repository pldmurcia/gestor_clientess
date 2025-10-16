import React, { useState } from 'react';
import { Schedule, Day, Account, Session } from '../types';
import { optimizeSchedule } from '../services/geminiService';
import MagicIcon from './icons/MagicIcon';

interface ScheduleCalendarProps {
    schedule: Schedule;
    setSchedule: (schedule: Schedule) => void;
    accounts: Account[];
    accountsMap: Map<string, Account>;
}

const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = async () => {
        if (accounts.length === 0) {
            setError("Please add at least one *active* account to optimize the schedule. Pending or suspended accounts are not scheduled.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const newSchedule = await optimizeSchedule(accounts);
            setSchedule(newSchedule);
        } catch (err) {
            console.error(err);
            setError("Failed to generate schedule. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Weekly Schedule</h2>
                <button
                    onClick={handleOptimize}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <MagicIcon />
                    )}
                    <span className="ml-2">{isLoading ? 'Optimizing...' : 'AI Optimize Schedule'}</span>
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