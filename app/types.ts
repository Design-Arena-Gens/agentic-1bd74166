export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type InstrumentType = 'stocks' | 'options' | 'cfds' | 'futures';
export type BrokerType = 'IBKR' | 'Netwealth' | 'MetaTrader' | 'Other';

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  instrumentType: InstrumentType;
  broker: BrokerType;
  strategy: string;

  // Entry
  entryTime: string;
  entryPrice: number;
  quantity: number;

  // Exit
  exitTime?: string;
  exitPrice?: number;

  // Risk Management
  stopLoss?: number;
  takeProfit?: number;

  // P&L
  realizedPnL?: number;
  unrealizedPnL?: number;

  // Pre-trade
  thesis: string;
  setupQuality: number; // 1-10
  emotionalState: string;
  marketCondition: string;

  // Post-trade
  exitReason?: string;
  lessonsLearned?: string;
  mistakes?: string[];

  // Tags
  tags?: string[];

  // Screenshots/Charts
  chartUrls?: string[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  rules: string[];
  timeframe: string;
  instruments: InstrumentType[];
  active: boolean;
  performance: {
    trades: number;
    winRate: number;
    avgReturn: number;
  };
}

export interface RiskMetrics {
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  openPositions: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  dailyRiskUsed: number;
  maxDailyRisk: number;
}

export interface EmotionalState {
  timestamp: string;
  mood: 'calm' | 'anxious' | 'excited' | 'frustrated' | 'confident';
  impulseLevel: number; // 1-10
  notes: string;
}
