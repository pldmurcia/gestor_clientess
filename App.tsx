import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Account, Schedule, Day, Withdrawal } from './types';
import AccountManager from './components/AccountManager';
import ScheduleCalendar from './components/ScheduleCalendar';
import AccountDetailsModal from './components/AccountDetailsModal';
import Dashboard from './components/Dashboard';
import { AccountIcon, CalendarIcon, DashboardIcon } from './components/icons/NavIcons';
import { generateLocalSchedule } from './services/scheduleService';

const initialSchedule: Schedule = {
    monday: { london: [], newYork: [] },
    tuesday: { london: [], newYork: [] },
    wednesday: { london: [], newYork: [] },
    thursday: { london: [], newYork: [] },
    friday: { london: [], newYork: [] },
};

const ACCOUNTS_STORAGE_KEY = 'prop_trader_accounts_v1';

type View = 'dashboard' | 'accounts' | 'calendar';

const App: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>(() => {
        try {
            const item = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error('Error reading accounts from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
        } catch (error) {
            console.error('Error saving accounts to localStorage', error);
        }
    }, [accounts]);

    const [schedule, setSchedule] = useState<Schedule>(initialSchedule);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const activeAccounts = useMemo(() => accounts.filter(acc => acc.status === 'active'), [accounts]);
    const prevActiveAccountsCount = useRef(0);

    useEffect(() => {
        const currentActiveCount = activeAccounts.length;
        if (
            (prevActiveAccountsCount.current === 0 && currentActiveCount > 0) ||
            (currentActiveCount > prevActiveAccountsCount.current)
        ) {
             if (currentActiveCount > 0) {
                const newSchedule = generateLocalSchedule(activeAccounts);
                setSchedule(newSchedule);
            }
        }
        if (currentActiveCount === 0 && prevActiveAccountsCount.current > 0) {
            setSchedule(initialSchedule);
        }

        prevActiveAccountsCount.current = currentActiveCount;
    }, [activeAccounts]);

    const accountsMap = useMemo(() => {
        const map = new Map<string, Account>();
        accounts.forEach(account => map.set(account.id, account));
        return map;
    }, [accounts]);

    const dashboardMetrics = useMemo(() => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.size, 0);
        const totalCosts = accounts.reduce((sum, acc) => sum + acc.cost, 0);
        const totalWithdrawals = accounts.reduce((sum, acc) => sum + acc.withdrawals.reduce((wSum, w) => wSum + w.amount, 0), 0);
        const netProfit = totalWithdrawals - totalCosts;
        const accountsWithWithdrawals = accounts.filter(acc => acc.withdrawals.length > 0).length;
        const withdrawalSuccessRate = accounts.length > 0 ? (accountsWithWithdrawals / accounts.length) * 100 : 0;

        return { totalBalance, totalCosts, totalWithdrawals, netProfit, withdrawalSuccessRate };
    }, [accounts]);

    const addAccount = (account: Omit<Account, 'id' | 'withdrawals'>) => {
        const newAccount: Account = {
            ...account,
            id: `acc-${Date.now()}`,
            withdrawals: [],
        };
        setAccounts(prev => [...prev, newAccount]);
    };

    const updateAccount = (updatedAccount: Account) => {
        setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
        if (editingAccount?.id === updatedAccount.id) {
            setEditingAccount(updatedAccount);
        }
    };

    const deleteAccount = (id: string) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        
        // If account is deleted, clear its presence from the schedule
        const newSchedule = JSON.parse(JSON.stringify(schedule)) as Schedule;
        let scheduleChanged = false;
        for (const day of Object.keys(newSchedule) as Day[]) {
            const londonBefore = newSchedule[day].london.length;
            const newYorkBefore = newSchedule[day].newYork.length;
            newSchedule[day].london = newSchedule[day].london.filter(accId => accId !== id);
            newSchedule[day].newYork = newSchedule[day].newYork.filter(accId => accId !== id);
             if (newSchedule[day].london.length !== londonBefore || newSchedule[day].newYork.length !== newYorkBefore) {
                scheduleChanged = true;
            }
        }
        if (scheduleChanged) {
             setSchedule(newSchedule);
        }
    };

    const addWithdrawal = (accountId: string, withdrawal: Omit<Withdrawal, 'id'>) => {
        const accountToUpdate = accounts.find(acc => acc.id === accountId);
        if (!accountToUpdate) return;
        
        const newWithdrawal: Withdrawal = { ...withdrawal, id: `w-${Date.now()}` };
        const updatedAccount = {
            ...accountToUpdate,
            withdrawals: [...accountToUpdate.withdrawals, newWithdrawal]
        };
        updateAccount(updatedAccount);
    };
    
    const deleteWithdrawal = (accountId: string, withdrawalId: string) => {
        const accountToUpdate = accounts.find(acc => acc.id === accountId);
        if (!accountToUpdate) return;

        const updatedAccount = {
            ...accountToUpdate,
            withdrawals: accountToUpdate.withdrawals.filter(w => w.id !== withdrawalId)
        };
        updateAccount(updatedAccount);
    };

    const NavButton: React.FC<{ view: View, icon: React.ReactNode, text: string }> = ({ view, icon, text }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${currentView === view ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            {icon}
            {text}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="relative text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">
                        Prop Trader Dashboard
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Your AI-powered trading operations hub.
                    </p>
                </header>

                <nav className="flex justify-center items-center bg-gray-800/50 rounded-lg p-2 mb-8 shadow-md">
                   <div className="flex space-x-2">
                        <NavButton view="dashboard" icon={<DashboardIcon />} text="Dashboard" />
                        <NavButton view="accounts" icon={<AccountIcon />} text="Accounts" />
                        <NavButton view="calendar" icon={<CalendarIcon />} text="Calendar" />
                   </div>
                </nav>
                
                <main>
                    {currentView === 'dashboard' && <Dashboard metrics={dashboardMetrics} />}
                    
                    {currentView === 'accounts' && (
                        <AccountManager 
                            accounts={accounts} 
                            addAccount={addAccount} 
                            deleteAccount={deleteAccount}
                            onEditAccount={setEditingAccount} 
                        />
                    )}

                    {currentView === 'calendar' && (
                        <ScheduleCalendar 
                            schedule={schedule}
                            setSchedule={setSchedule}
                            accounts={activeAccounts}
                            accountsMap={accountsMap}
                        />
                    )}
                </main>
            </div>

            {editingAccount && (
                <AccountDetailsModal
                    account={editingAccount}
                    onClose={() => setEditingAccount(null)}
                    onSave={(acc) => {
                        updateAccount(acc);
                        setEditingAccount(null);
                    }}
                    onAddWithdrawal={addWithdrawal}
                    onDeleteWithdrawal={deleteWithdrawal}
                />
            )}
        </div>
    );
};

export default App;