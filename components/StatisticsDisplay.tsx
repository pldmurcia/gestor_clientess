import React from 'react';
import { StatSummary, TradingStats, StatItem } from '../types';

const Pnl: React.FC<{ value: number }> = ({ value }) => (
    <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
        {value.toFixed(2)}
    </span>
);

const StatRow: React.FC<{ label: string; data: StatSummary }> = ({ label, data }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50">
        <td className="py-2 px-3 font-medium text-cyan-400">{label}</td>
        <td className="py-2 px-3 text-center">{data.trades}</td>
        <td className="py-2 px-3 text-center font-semibold"><Pnl value={data.pnl} /></td>
        <td className="py-2 px-3 text-center">{data.winRate.toFixed(2)}%</td>
        <td className="py-2 px-3 text-center text-green-400">{data.avgWin.toFixed(2)}</td>
        <td className="py-2 px-3 text-center text-red-400">{data.avgLoss.toFixed(2)}</td>
        <td className="py-2 px-3 text-center">{data.profitFactor ? data.profitFactor.toFixed(2) : 'N/A'}</td>
    </tr>
);

const StatTable: React.FC<{ title: string; data: StatItem[] }> = ({ title, data }) => {
    const sortedData = [...data].sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

    if (sortedData.length === 0) return null;

    return (
        <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="py-2 px-3">Metric</th>
                            <th scope="col" className="py-2 px-3 text-center">Trades</th>
                            <th scope="col" className="py-2 px-3 text-center">Net PnL ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Win Rate</th>
                            <th scope="col" className="py-2 px-3 text-center">Avg Win ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Avg Loss ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Profit Factor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(item => (
                            <StatRow key={item.key} label={item.key} data={item.summary} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatisticsDisplay: React.FC<{ stats: TradingStats }> = ({ stats }) => {
    const directionData: StatItem[] = [
        { key: 'Long', summary: stats.byDirection.long },
        { key: 'Short', summary: stats.byDirection.short }
    ];

    return (
        <div className="mt-6 space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-white">Performance Analysis</h3>
            <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Overall Performance</h4>
                 <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="py-2 px-3">Metric</th>
                            <th scope="col" className="py-2 px-3 text-center">Trades</th>
                            <th scope="col" className="py-2 px-3 text-center">Net PnL ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Win Rate</th>
                            <th scope="col" className="py-2 px-3 text-center">Avg Win ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Avg Loss ($)</th>
                            <th scope="col" className="py-2 px-3 text-center">Profit Factor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <StatRow label="Overall" data={stats.overall} />
                    </tbody>
                </table>
            </div>

            <StatTable title="By Direction" data={directionData} />
            <StatTable title="By Asset" data={stats.byAsset} />
            <StatTable title="By Day of Week" data={stats.byDayOfWeek} />
            <StatTable title="By Hour of Day" data={stats.byHour} />
            <StatTable title="By Month" data={stats.byMonth} />
            <StatTable title="By Week of Year" data={stats.byWeek} />

        </div>
    );
};

export default StatisticsDisplay;