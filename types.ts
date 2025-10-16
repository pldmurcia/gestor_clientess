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
