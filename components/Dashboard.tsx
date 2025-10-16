import React from 'react';

interface DashboardMetrics {
    totalBalance: number;
    totalCosts: number;
    totalWithdrawals: number;
    netProfit: number;
    withdrawalSuccessRate: number;
}

interface DashboardProps {
    metrics: DashboardMetrics;
}

const MetricCard: React.FC<{ title: string; value: string; description: string; className?: string }> = ({ title, value, description, className = '' }) => (
    <div className={`bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 ${className}`}>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <p className="text-xs text-gray-500 mt-4">{description}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
    const { totalBalance, totalCosts, totalWithdrawals, netProfit, withdrawalSuccessRate } = metrics;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Account Balance"
                    value={formatCurrency(totalBalance)}
                    description="Sum of all account sizes, active or not."
                    className="lg:col-span-2 bg-gradient-to-br from-cyan-900 to-gray-800"
                />
                 <MetricCard 
                    title="Evaluation Costs"
                    value={formatCurrency(totalCosts)}
                    description="Total amount paid for all evaluations."
                />
                 <MetricCard 
                    title="Total Withdrawals"
                    value={formatCurrency(totalWithdrawals)}
                    description="Total profits successfully withdrawn."
                />
                <MetricCard 
                    title="Net Profit (ROI)"
                    value={formatCurrency(netProfit)}
                    description="Withdrawals minus Evaluation Costs."
                    className={`lg:col-span-2 ${netProfit >= 0 ? 'bg-gradient-to-br from-green-900 to-gray-800' : 'bg-gradient-to-br from-red-900 to-gray-800'}`}
                />
                <MetricCard 
                    title="Withdrawal Rate"
                    value={`${withdrawalSuccessRate.toFixed(1)}%`}
                    description="% of accounts with at least one withdrawal."
                    className="lg:col-span-2"
                />
            </div>
        </div>
    );
};

export default Dashboard;
