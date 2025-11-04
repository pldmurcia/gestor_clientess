export type AccountStatus = 'active' | 'suspended' | 'pending';
export type Session = 'london' | 'newYork';
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
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
}

export type Schedule = Record<Day, Record<Session, string[]>>;

// Fix: Added missing type definitions for trading statistics to resolve import errors.
export interface StatSummary {
  trades: number;
  pnl: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor?: number | null;
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
