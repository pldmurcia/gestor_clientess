import React, { useState, useEffect, FormEvent } from 'react';
import { Account, AccountStatus, Withdrawal } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface AccountDetailsModalProps {
    account: Account;
    onClose: () => void;
    onSave: (account: Account) => void;
    onAddWithdrawal: (accountId: string, withdrawal: Omit<Withdrawal, 'id'>) => void;
    onDeleteWithdrawal: (accountId: string, withdrawalId: string) => void;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ account, onClose, onSave, onAddWithdrawal, onDeleteWithdrawal }) => {
    const [formData, setFormData] = useState<Account>(account);

    const [withdrawalDate, setWithdrawalDate] = useState('');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');

    useEffect(() => {
        setFormData(account);
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };

        if (name === 'status' && value !== 'suspended') {
            delete updatedFormData.suspensionDate;
        }
        if (name === 'size' || name === 'cost') {
             updatedFormData[name] = value === '' ? 0 : Number(value);
        }

        setFormData(updatedFormData);
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleAddWithdrawal = (e: FormEvent) => {
        e.preventDefault();
        if (withdrawalDate && withdrawalAmount && !isNaN(Number(withdrawalAmount))) {
            onAddWithdrawal(account.id, { date: withdrawalDate, amount: Number(withdrawalAmount) });
            setWithdrawalDate('');
            setWithdrawalAmount('');
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Account Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Account Edit Form */}
                    <form className="space-y-4" onSubmit={handleSave}>
                        <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">General Information</h3>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Prop Firm</label>
                            <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">Size ($)</label>
                                <input type="number" name="size" value={formData.size} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                            </div>
                            <div>
                                <label htmlFor="cost" className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
                                <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500">
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            {formData.status === 'suspended' && (
                                <div>
                                    <label htmlFor="suspensionDate" className="block text-sm font-medium text-gray-300 mb-1">Suspension Date</label>
                                    <input type="date" name="suspensionDate" value={formData.suspensionDate || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Withdrawal Manager */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">Withdrawal Manager</h3>
                        <form onSubmit={handleAddWithdrawal} className="flex items-end gap-3">
                            <div className="flex-grow">
                                <label htmlFor="withdrawalDate" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                                <input type="date" id="withdrawalDate" value={withdrawalDate} onChange={e => setWithdrawalDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                            </div>
                            <div className="flex-grow">
                                <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-300 mb-1">Amount ($)</label>
                                <input type="number" id="withdrawalAmount" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} placeholder="1000" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500" required />
                            </div>
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition h-10 flex items-center"><PlusIcon /></button>
                        </form>
                        <div className="max-h-40 overflow-y-auto pr-2 -mr-2">
                             {formData.withdrawals.length > 0 ? (
                                <ul className="space-y-2">
                                    {formData.withdrawals.map(w => (
                                        <li key={w.id} className="bg-gray-700/50 rounded-md p-2 flex justify-between items-center text-sm">
                                            <div>
                                                <span className="font-semibold text-white">${w.amount.toLocaleString()}</span>
                                                <span className="text-gray-400 ml-2">{new Date(w.date + 'T00:00:00').toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => onDeleteWithdrawal(account.id, w.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center text-sm py-2">No withdrawals recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-x-3">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition">Cancel</button>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};

export default AccountDetailsModal;
