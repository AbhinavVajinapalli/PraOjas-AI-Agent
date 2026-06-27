export interface IndexData {
  id: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sparkline: number[];
}

export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  weight: number; // weightage in Nifty 50
  sparkline: number[];
  lastUpdate: number;
}

export interface HistoricalBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Portfolio {
  cash: number;
  holdings: Record<string, Holding>;
  transactions: Transaction[];
}

export interface Holding {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  totalAmount: number;
}

export type Timeframe = '1D' | '1W' | '1M' | '1Y' | '5Y';
