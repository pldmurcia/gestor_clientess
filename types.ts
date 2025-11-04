export type AccountStatus = 'active' | 'suspended' | 'pending';
export type Session = 'london' | 'newYork';
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
}

export interface TradingHistoryFile {
    id: string;
    name: string;
    uploadDate: string;
    content: string; // The raw text content of the file
}

export interface StatSummary {
    trades: number;
    pnl: number;
    wins: number;
    losses: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
}

export interface StatItem {
    key: string;
    summary: StatSummary;
}

export interface TradingStats {
    overall: StatSummary;
    byAsset: StatItem[];
    byDayOfWeek: StatItem[];
    byHour: StatItem[];
    byMonth: StatItem[];
    byWeek: StatItem[];
    byDirection: {
        long: StatSummary;
        short: StatSummary;
    };
}

export interface Account {
  id: string;
  name: string;
  company: string;
  size: number;
  cost: number;
  status: AccountStatus;
  suspensionDate?: string;
  withdrawals: Withdrawal[];
  historyFiles?: TradingHistoryFile[];
  stats?: TradingStats;
}

export type Schedule = Record<Day, Record<Session, string[]>>;