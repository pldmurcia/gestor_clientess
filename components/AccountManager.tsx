import React, { useState, useMemo } from 'react';
import { Account, AccountStatus, Withdrawal } from '../types';
import AccountDetailsModal from './AccountDetailsModal';
import PlusIcon from './icons/PlusIcon';
import EyeIcon from './icons/EyeIcon';

interface AccountManagerProps {
    accounts: Account[];
    setAccounts: (accounts: Account[]) => void;
}

const statusStyles: Record<AccountStatus, string> = {
    active: 'bg-green-500/20 text-green-300',
    pending: 'bg-yellow-500/20 text-yellow-300',
    suspended: 'bg-red-500/20 text-red-300',
};

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, setAccounts }) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddAccount = () => {
        const newAccount: Account = {
            id: crypto.randomUUID(),
            name: `New Account ${accounts.length + 1}`,
            company: 'FTMO',
            size: 100000,
            cost: 500,
            status: 'pending',
            withdrawals: [],
        };
        setAccounts([...accounts, newAccount]);
    };

    const handleSaveAccount = (accountToSave: Account) => {
        setAccounts(accounts.map(acc => acc.id === accountToSave.id ? accountToSave : acc));
        setIsModalOpen(false);
        setSelectedAccount(null);
    };
    
    const handleAddWithdrawal = (accountId: string, withdrawal: Omit<Withdrawal, 'id'>) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return;
        const newWithdrawal = { ...withdrawal, id: crypto.randomUUID() };
        const updatedAccount = { ...account, withdrawals: [...account.withdrawals, newWithdrawal] };
        handleSaveAccount(updatedAccount);
    };
    
    const handleDeleteWithdrawal = (accountId: string, withdrawalId: string) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return;
        const updatedAccount = { ...account, withdrawals: account.withdrawals.filter(w => w.id !== withdrawalId) };
        handleSaveAccount(updatedAccount);
    };

    const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts]);
    
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Account Management</h2>
                    <button
                        onClick={handleAddAccount}
                        className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        <PlusIcon />
                        Add New Account
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="py-3 px-6">Name</th>
                                <th scope="col" className="py-3 px-6">Prop Firm</th>
                                <th scope="col" className="py-3 px-6 text-right">Size</th>
                                <th scope="col" className="py-3 px-6 text-right">Withdrawals</th>
                                <th scope="col" className="py-3 px-6 text-center">Status</th>
                                <th scope="col" className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAccounts.map(account => (
                                <tr key={account.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="py-4 px-6 font-medium text-white">{account.name}</td>
                                    <td className="py-4 px-6">{account.company}</td>
                                    <td className="py-4 px-6 text-right">${account.size.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-right">${account.withdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[account.status]}`}>
                                            {account.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button onClick={() => { setSelectedAccount(account); setIsModalOpen(true); }} className="text-cyan-400 hover:text-cyan-300">
                                            <EyeIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedAccount && (
                <AccountDetailsModal
                    account={selectedAccount}
                    onClose={() => { setIsModalOpen(false); setSelectedAccount(null); }}
                    onSave={handleSaveAccount}
                    onAddWithdrawal={handleAddWithdrawal}
                    onDeleteWithdrawal={handleDeleteWithdrawal}
                />
            )}
        </div>
    );
};

export default AccountManager;