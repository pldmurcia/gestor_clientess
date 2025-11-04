import React, { useState, useMemo } from 'react';
import { Account, AccountStatus } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import EyeIcon from './icons/EyeIcon';

interface AccountManagerProps {
    accounts: Account[];
    addAccount: (account: Omit<Account, 'id' | 'withdrawals' | 'historyFiles' | 'stats'>) => void;
    deleteAccount: (id: string) => void;
    onEditAccount: (account: Account) => void;
}

const statusColors: Record<AccountStatus, { bg: string; text: string }> = {
    active: { bg: 'bg-green-500/20', text: 'text-green-300' },
    suspended: { bg: 'bg-red-500/20', text: 'text-red-300' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
};

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, addAccount, deleteAccount, onEditAccount }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [size, setSize] = useState('');
    const [cost, setCost] = useState('');
    const [status, setStatus] = useState<AccountStatus>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && company && size && cost && !isNaN(Number(size)) && !isNaN(Number(cost))) {
            addAccount({ name, company, size: Number(size), cost: Number(cost), status });
            setName('');
            setCompany('');
            setSize('');
            setCost('');
            setStatus('pending');
            setIsFormVisible(false); // Hide form after submission
        }
    };

    const sortedAndFilteredAccounts = useMemo(() => {
        const statusOrder: Record<AccountStatus, number> = {
            active: 0,
            pending: 1,
            suspended: 2,
        };

        const lowercasedSearchTerm = searchTerm.toLowerCase();

        return accounts
            .filter(acc =>
                acc.name.toLowerCase().includes(lowercasedSearchTerm) ||
                acc.company.toLowerCase().includes(lowercasedSearchTerm)
            )
            .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [accounts, searchTerm]);


    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Manage Accounts</h2>
            
            <button 
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 mb-4"
            >
                <PlusIcon /> {isFormVisible ? 'Hide Form' : 'Add New Account'}
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900/50 p-4 rounded-md">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Phase 1" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                    </div>
                     <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Prop Firm</label>
                        <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., FTMO" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">Size ($)</label>
                            <input type="number" id="size" value={size} onChange={e => setSize(e.target.value)} placeholder="100000" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                        </div>
                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
                            <input type="number" id="cost" value={cost} onChange={e => setCost(e.target.value)} placeholder="500" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Initial Status</label>
                        <select id="status" value={status} onChange={e => setStatus(e.target.value as AccountStatus)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
                        <PlusIcon /> Add Account
                    </button>
                </form>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by name or company..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <h3 className="text-xl font-semibold text-white mb-3">Your Accounts ({sortedAndFilteredAccounts.length})</h3>
                <ul className="space-y-3">
                    {sortedAndFilteredAccounts.length > 0 ? sortedAndFilteredAccounts.map(acc => {
                        const totalWithdrawals = acc.withdrawals.reduce((sum, w) => sum + w.amount, 0);
                        const netProfit = totalWithdrawals - acc.cost;

                        return (
                            <li key={acc.id} className="bg-gray-700 rounded-md p-3 flex justify-between items-center transition duration-200 hover:bg-gray-600">
                                <div>
                                    <p className="font-semibold text-white">{acc.name} <span className="text-xs text-cyan-400">({acc.company})</span></p>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                        <p className="text-gray-300">
                                            Balance: <span className="font-medium text-white">${acc.size.toLocaleString()}</span>
                                        </p>
                                        <p className={`font-medium ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            Net Profit: <span>${netProfit.toLocaleString()}</span>
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[acc.status].bg} ${statusColors[acc.status].text}`}>{acc.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <button onClick={() => onEditAccount(acc)} className="text-gray-400 hover:text-cyan-400 transition-colors p-1 rounded-full">
                                        <EyeIcon />
                                    </button>
                                    <button onClick={() => deleteAccount(acc.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        );
                    }) : (
                        <p className="text-gray-400 text-center py-4">No accounts match your search.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AccountManager;