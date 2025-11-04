import React, { useState, useEffect } from 'react';
import AccountManager from './components/AccountManager';
import ScheduleCalendar from './components/ScheduleCalendar';
import Dashboard from './components/Dashboard';
import { Account, Schedule } from './types';
import { ChartIcon, CalendarIcon, HomeIcon } from './components/icons/NavIcons';

// Default empty schedule
const initialSchedule: Schedule = {
  monday: { london: [], newYork: [] },
  tuesday: { london: [], newYork: [] },
  wednesday: { london: [], newYork: [] },
  thursday: { london: [], newYork: [] },
  friday: { london: [], newYork: [] },
};

const APP_STORAGE_KEY = 'prop-trader-accounts';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<'dashboard' | 'accounts' | 'schedule'>('dashboard');
    
    const [accounts, setAccounts] = useState<Account[]>(() => {
        try {
            const storedAccounts = localStorage.getItem(APP_STORAGE_KEY);
            return storedAccounts ? JSON.parse(storedAccounts) : [];
        } catch (error) {
            console.error("Failed to parse accounts from localStorage", error);
            return [];
        }
    });
    const [schedule, setSchedule] = useState<Schedule>(initialSchedule);

    useEffect(() => {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(accounts));
        } catch (error) {
            console.error("Failed to save accounts to localStorage", error);
        }
    }, [accounts]);


    // Create a map for quick account lookup
    const accountsMap = new Map(accounts.map(acc => [acc.id, acc]));

    // Calculate metrics for the dashboard
    const calculateMetrics = () => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.size, 0);
        const totalCosts = accounts.reduce((sum, acc) => sum + acc.cost, 0);
        const totalWithdrawals = accounts.reduce((sum, acc) => sum + acc.withdrawals.reduce((wSum, w) => wSum + w.amount, 0), 0);
        const netProfit = totalWithdrawals - totalCosts;
        const accountsWithWithdrawals = accounts.filter(acc => acc.withdrawals.length > 0).length;
        const withdrawalSuccessRate = accounts.length > 0 ? (accountsWithWithdrawals / accounts.length) * 100 : 0;
        
        return { totalBalance, totalCosts, totalWithdrawals, netProfit, withdrawalSuccessRate };
    };
    const metrics = calculateMetrics();

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard metrics={metrics} />;
            case 'accounts':
                return <AccountManager accounts={accounts} setAccounts={setAccounts} />;
            case 'schedule':
                const activeAccounts = accounts.filter(a => a.status === 'active');
                return <ScheduleCalendar schedule={schedule} setSchedule={setSchedule} accounts={activeAccounts} accountsMap={accountsMap} />;
            default:
                return <Dashboard metrics={metrics} />;
        }
    };
    
    const NavButton: React.FC<{ view: 'dashboard' | 'accounts' | 'schedule'; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors duration-200 ${
                activeView === view ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen flex">
            <aside className="w-64 bg-gray-800 p-4 flex flex-col fixed h-full">
                 <div className="mb-8">
                    <h1 className="text-2xl font-bold text-center text-white">Prop<span className="text-cyan-400">Pilot</span></h1>
                </div>
                <nav className="flex-grow">
                    <NavButton view="dashboard" label="Dashboard" icon={<HomeIcon />} />
                    <NavButton view="accounts" label="Accounts" icon={<ChartIcon />} />
                    <NavButton view="schedule" label="Schedule" icon={<CalendarIcon />} />
                </nav>
            </aside>
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default App;