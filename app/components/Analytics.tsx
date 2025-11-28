'use client';

import { Trade, RiskMetrics } from '../types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, startOfMonth, eachDayOfInterval, subDays } from 'date-fns';

interface AnalyticsProps {
  trades: Trade[];
  riskMetrics: RiskMetrics;
}

export default function Analytics({ trades, riskMetrics }: AnalyticsProps) {
  const closedTrades = trades.filter(t => t.status === 'closed');

  // Daily P&L Chart Data
  const getDailyPnLData = () => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(day => {
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayTrades = closedTrades.filter(t => {
        const exitDate = new Date(t.exitTime || t.entryTime);
        return exitDate >= dayStart && exitDate < dayEnd;
      });

      const pnl = dayTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

      return {
        date: format(day, 'MM/dd'),
        pnl: parseFloat(pnl.toFixed(2)),
      };
    });
  };

  // Strategy Performance Data
  const getStrategyData = () => {
    const strategyMap = new Map<string, { trades: number; pnl: number; wins: number }>();

    closedTrades.forEach(trade => {
      const existing = strategyMap.get(trade.strategy) || { trades: 0, pnl: 0, wins: 0 };
      strategyMap.set(trade.strategy, {
        trades: existing.trades + 1,
        pnl: existing.pnl + (trade.realizedPnL || 0),
        wins: existing.wins + ((trade.realizedPnL || 0) > 0 ? 1 : 0),
      });
    });

    return Array.from(strategyMap.entries()).map(([name, data]) => ({
      name,
      trades: data.trades,
      pnl: parseFloat(data.pnl.toFixed(2)),
      winRate: data.trades > 0 ? parseFloat(((data.wins / data.trades) * 100).toFixed(1)) : 0,
    }));
  };

  // Win/Loss Distribution
  const getWinLossData = () => {
    const wins = closedTrades.filter(t => (t.realizedPnL || 0) > 0).length;
    const losses = closedTrades.filter(t => (t.realizedPnL || 0) < 0).length;
    const breakeven = closedTrades.filter(t => (t.realizedPnL || 0) === 0).length;

    return [
      { name: 'Wins', value: wins, color: '#22c55e' },
      { name: 'Losses', value: losses, color: '#ef4444' },
      { name: 'Breakeven', value: breakeven, color: '#94a3b8' },
    ];
  };

  // Instrument Performance
  const getInstrumentData = () => {
    const instrumentMap = new Map<string, { trades: number; pnl: number }>();

    closedTrades.forEach(trade => {
      const existing = instrumentMap.get(trade.instrumentType) || { trades: 0, pnl: 0 };
      instrumentMap.set(trade.instrumentType, {
        trades: existing.trades + 1,
        pnl: existing.pnl + (trade.realizedPnL || 0),
      });
    });

    return Array.from(instrumentMap.entries()).map(([name, data]) => ({
      name,
      trades: data.trades,
      pnl: parseFloat(data.pnl.toFixed(2)),
    }));
  };

  // Setup Quality vs Outcome
  const getSetupQualityData = () => {
    const qualityMap = new Map<number, { wins: number; losses: number }>();

    closedTrades.forEach(trade => {
      const quality = Math.floor(trade.setupQuality / 2) * 2; // Group by 2s
      const existing = qualityMap.get(quality) || { wins: 0, losses: 0 };

      if ((trade.realizedPnL || 0) > 0) {
        qualityMap.set(quality, { ...existing, wins: existing.wins + 1 });
      } else {
        qualityMap.set(quality, { ...existing, losses: existing.losses + 1 });
      }
    });

    return Array.from(qualityMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([quality, data]) => ({
        quality: `${quality}-${quality + 1}`,
        wins: data.wins,
        losses: data.losses,
        winRate: data.wins + data.losses > 0
          ? parseFloat(((data.wins / (data.wins + data.losses)) * 100).toFixed(1))
          : 0,
      }));
  };

  const dailyPnLData = getDailyPnLData();
  const strategyData = getStrategyData();
  const winLossData = getWinLossData();
  const instrumentData = getInstrumentData();
  const setupQualityData = getSetupQualityData();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>

      {closedTrades.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No closed trades yet. Complete some trades to see analytics!</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-gray-900">{closedTrades.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">{riskMetrics.winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Profit Factor</div>
              <div className="text-2xl font-bold text-gray-900">{riskMetrics.profitFactor.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${riskMetrics.monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${riskMetrics.monthlyPnL.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Daily P&L Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily P&L (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyPnLData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                />
                <Bar dataKey="pnl" fill="#0ea5e9">
                  {dailyPnLData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Performance */}
            {strategyData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strategyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pnl" fill="#0ea5e9" name="P&L ($)" />
                    <Bar dataKey="winRate" fill="#22c55e" name="Win Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Win/Loss Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Win/Loss Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Instrument Performance */}
            {instrumentData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Instrument</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={instrumentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="pnl" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Setup Quality Analysis */}
            {setupQualityData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Quality vs Win Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={setupQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quality" label={{ value: 'Setup Quality', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" fill="#22c55e" name="Wins" />
                    <Bar dataKey="losses" fill="#ef4444" name="Losses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Trade Distribution</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Long Trades:</span>
                    <span className="font-medium">{closedTrades.filter(t => t.direction === 'long').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Short Trades:</span>
                    <span className="font-medium">{closedTrades.filter(t => t.direction === 'short').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Setup Quality:</span>
                    <span className="font-medium">
                      {closedTrades.length > 0
                        ? (closedTrades.reduce((sum, t) => sum + t.setupQuality, 0) / closedTrades.length).toFixed(1)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Risk Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Win:</span>
                    <span className="font-medium text-green-600">${riskMetrics.avgWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Loss:</span>
                    <span className="font-medium text-red-600">${riskMetrics.avgLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown:</span>
                    <span className="font-medium text-red-600">${riskMetrics.maxDrawdown.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Performance Ratios</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpe Ratio:</span>
                    <span className="font-medium">{riskMetrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Factor:</span>
                    <span className="font-medium">{riskMetrics.profitFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk/Reward:</span>
                    <span className="font-medium">
                      {riskMetrics.avgLoss > 0 ? (riskMetrics.avgWin / riskMetrics.avgLoss).toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
