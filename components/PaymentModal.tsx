import React from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, featureName }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md text-center p-8"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Upgrade to Pro</h2>
                <p className="text-gray-300 mb-6">
                    The "{featureName}" feature is part of our Pro plan. Upgrade now to unlock advanced analytics, unlimited accounts, and more!
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition">
                        Maybe Later
                    </button>
                    <button 
                        onClick={() => alert("Redirecting to checkout...")} 
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-md transition"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
