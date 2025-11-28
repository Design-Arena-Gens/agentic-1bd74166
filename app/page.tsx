'use client';

import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TradeEntry from './components/TradeEntry';
import TradeHistory from './components/TradeHistory';
import RiskMonitor from './components/RiskMonitor';
import StrategyManager from './components/StrategyManager';
import Analytics from './components/Analytics';
import { Trade, Strategy, RiskMetrics } from './types';
import { Activity, TrendingUp, Shield, BookOpen, BarChart3, Plus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'history' | 'risk' | 'strategies' | 'analytics'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    dailyPnL: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    openPositions: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    dailyRiskUsed: 0,
    maxDailyRisk: 2000,
  });

  // Load data from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('tms_trades');
    const savedStrategies = localStorage.getItem('tms_strategies');

    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }

    if (savedStrategies) {
      setStrategies(JSON.parse(savedStrategies));
    } else {
      // Initialize with default strategies
      const defaultStrategies: Strategy[] = [
        {
          id: '1',
          name: 'Momentum Breakout',
          description: 'Trading breakouts with volume confirmation',
          rules: ['Price breaks above resistance', 'Volume > 2x average', 'RSI > 60'],
          timeframe: '15min',
          instruments: ['stocks', 'futures'],
          active: true,
          performance: { trades: 0, winRate: 0, avgReturn: 0 }
        },
        {
          id: '2',
          name: 'Mean Reversion',
          description: 'Counter-trend plays at extremes',
          rules: ['Price 2+ std dev from mean', 'RSI < 30 or > 70', 'Support/resistance nearby'],
          timeframe: '1h',
          instruments: ['options', 'cfds'],
          active: true,
          performance: { trades: 0, winRate: 0, avgReturn: 0 }
        }
      ];
      setStrategies(defaultStrategies);
      localStorage.setItem('tms_strategies', JSON.stringify(defaultStrategies));
    }
  }, []);

  // Calculate risk metrics whenever trades change
  useEffect(() => {
    calculateRiskMetrics();
  }, [trades]);

  // Save trades to localStorage whenever they change
  useEffect(() => {
    if (trades.length > 0) {
      localStorage.setItem('tms_trades', JSON.stringify(trades));
    }
  }, [trades]);

  const calculateRiskMetrics = () => {
    if (trades.length === 0) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const closedTrades = trades.filter(t => t.status === 'closed');
    const openTrades = trades.filter(t => t.status === 'open');

    // Calculate PnL
    const dailyPnL = closedTrades
      .filter(t => new Date(t.exitTime || t.entryTime) >= today)
      .reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

    const weeklyPnL = closedTrades
      .filter(t => new Date(t.exitTime || t.entryTime) >= weekAgo)
      .reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

    const monthlyPnL = closedTrades
      .filter(t => new Date(t.exitTime || t.entryTime) >= monthAgo)
      .reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

    // Calculate win rate
    const wins = closedTrades.filter(t => (t.realizedPnL || 0) > 0).length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    // Calculate avg win/loss
    const winningTrades = closedTrades.filter(t => (t.realizedPnL || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.realizedPnL || 0) < 0);

    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0) / winningTrades.length
      : 0;

    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0) / losingTrades.length)
      : 0;

    // Calculate profit factor
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    closedTrades.forEach(trade => {
      cumulative += trade.realizedPnL || 0;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map(t => (t.realizedPnL || 0) / (t.entryPrice * t.quantity));
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 1
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
      : 0;
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    // Calculate daily risk used
    const dailyRiskUsed = openTrades.reduce((sum, t) => {
      const risk = Math.abs(t.entryPrice - (t.stopLoss || t.entryPrice)) * t.quantity;
      return sum + risk;
    }, 0);

    setRiskMetrics({
      dailyPnL,
      weeklyPnL,
      monthlyPnL,
      openPositions: openTrades.length,
      maxDrawdown,
      sharpeRatio,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      dailyRiskUsed,
      maxDailyRisk: 2000,
    });
  };

  const addTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
    };
    setTrades([newTrade, ...trades]);
  };

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    setTrades(trades.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  const addStrategy = (strategy: Omit<Strategy, 'id'>) => {
    const newStrategy: Strategy = {
      ...strategy,
      id: Date.now().toString(),
    };
    const updatedStrategies = [...strategies, newStrategy];
    setStrategies(updatedStrategies);
    localStorage.setItem('tms_strategies', JSON.stringify(updatedStrategies));
  };

  const updateStrategy = (id: string, updates: Partial<Strategy>) => {
    const updatedStrategies = strategies.map(s => s.id === id ? { ...s, ...updates } : s);
    setStrategies(updatedStrategies);
    localStorage.setItem('tms_strategies', JSON.stringify(updatedStrategies));
  };

  const deleteStrategy = (id: string) => {
    const updatedStrategies = strategies.filter(s => s.id !== id);
    setStrategies(updatedStrategies);
    localStorage.setItem('tms_strategies', JSON.stringify(updatedStrategies));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'entry', label: 'New Trade', icon: Plus },
    { id: 'history', label: 'Trade History', icon: BookOpen },
    { id: 'risk', label: 'Risk Monitor', icon: Shield },
    { id: 'strategies', label: 'Strategies', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trading Management System</h1>
              <p className="text-sm text-gray-600 mt-1">A psychological prosthetic for discretionary traders</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Daily P&L</div>
              <div className={`text-2xl font-bold ${riskMetrics.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${riskMetrics.dailyPnL.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard trades={trades} riskMetrics={riskMetrics} strategies={strategies} />
        )}
        {activeTab === 'entry' && (
          <TradeEntry onAddTrade={addTrade} strategies={strategies} />
        )}
        {activeTab === 'history' && (
          <TradeHistory
            trades={trades}
            onUpdateTrade={updateTrade}
            onDeleteTrade={deleteTrade}
          />
        )}
        {activeTab === 'risk' && (
          <RiskMonitor trades={trades} riskMetrics={riskMetrics} />
        )}
        {activeTab === 'strategies' && (
          <StrategyManager
            strategies={strategies}
            onAddStrategy={addStrategy}
            onUpdateStrategy={updateStrategy}
            onDeleteStrategy={deleteStrategy}
            trades={trades}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics trades={trades} riskMetrics={riskMetrics} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Trading Management System - Built for discretionary traders who value discipline and self-awareness
          </p>
        </div>
      </footer>
    </div>
  );
}
