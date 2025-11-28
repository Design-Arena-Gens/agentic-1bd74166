'use client';

import { Trade, RiskMetrics, Strategy } from '../types';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Target, Zap } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  riskMetrics: RiskMetrics;
  strategies: Strategy[];
}

export default function Dashboard({ trades, riskMetrics, strategies }: DashboardProps) {
  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  const recentTrades = trades.slice(0, 5);

  const getStatusColor = (trade: Trade) => {
    if (trade.status === 'open') return 'bg-blue-100 text-blue-800';
    if ((trade.realizedPnL || 0) > 0) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const riskUtilization = (riskMetrics.dailyRiskUsed / riskMetrics.maxDailyRisk) * 100;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Daily P&L"
          value={`$${riskMetrics.dailyPnL.toFixed(2)}`}
          icon={riskMetrics.dailyPnL >= 0 ? TrendingUp : TrendingDown}
          color={riskMetrics.dailyPnL >= 0 ? 'green' : 'red'}
          subtitle={`Week: $${riskMetrics.weeklyPnL.toFixed(2)}`}
        />
        <MetricCard
          title="Open Positions"
          value={openTrades.length.toString()}
          icon={Activity}
          color="blue"
          subtitle={`${closedTrades.length} closed today`}
        />
        <MetricCard
          title="Win Rate"
          value={`${riskMetrics.winRate.toFixed(1)}%`}
          icon={Target}
          color="purple"
          subtitle={`${closedTrades.length} total trades`}
        />
        <MetricCard
          title="Profit Factor"
          value={riskMetrics.profitFactor.toFixed(2)}
          icon={Zap}
          color="yellow"
          subtitle={`Sharpe: ${riskMetrics.sharpeRatio.toFixed(2)}`}
        />
      </div>

      {/* Risk Alert */}
      {riskUtilization > 80 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Risk Limit Warning</h3>
            <p className="text-sm text-red-700 mt-1">
              You've used {riskUtilization.toFixed(1)}% of your daily risk limit. Consider reducing position sizes or avoiding new trades.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trades</h2>
          {recentTrades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trades yet. Start by logging your first trade!</p>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{trade.symbol}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(trade)}`}>
                        {trade.status}
                      </span>
                      <span className="text-xs text-gray-500">{trade.direction}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {trade.strategy} • {trade.quantity} @ ${trade.entryPrice.toFixed(2)}
                    </div>
                  </div>
                  {trade.status === 'closed' && (
                    <div className={`text-right font-semibold ${(trade.realizedPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.realizedPnL?.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strategy Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategy Performance</h2>
          {strategies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No strategies defined yet.</p>
          ) : (
            <div className="space-y-3">
              {strategies.map((strategy) => {
                const strategyTrades = trades.filter(t => t.strategy === strategy.name && t.status === 'closed');
                const wins = strategyTrades.filter(t => (t.realizedPnL || 0) > 0).length;
                const winRate = strategyTrades.length > 0 ? (wins / strategyTrades.length) * 100 : 0;
                const totalPnL = strategyTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

                return (
                  <div key={strategy.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{strategy.name}</span>
                      <span className={`text-sm font-medium ${strategy.active ? 'text-green-600' : 'text-gray-400'}`}>
                        {strategy.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Trades</div>
                        <div className="font-medium">{strategyTrades.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Win Rate</div>
                        <div className="font-medium">{winRate.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">P&L</div>
                        <div className={`font-medium ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${totalPnL.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Risk Management</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Risk Used</span>
              <span className="font-semibold">${riskMetrics.dailyRiskUsed.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${riskUtilization > 80 ? 'bg-red-600' : riskUtilization > 50 ? 'bg-yellow-500' : 'bg-green-600'}`}
                style={{ width: `${Math.min(riskUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Max: ${riskMetrics.maxDailyRisk.toFixed(0)}</span>
              <span>{riskUtilization.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trade Quality</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Win</span>
              <span className="font-semibold text-green-600">${riskMetrics.avgWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Loss</span>
              <span className="font-semibold text-red-600">${riskMetrics.avgLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">R:R Ratio</span>
              <span className="font-semibold">
                {riskMetrics.avgLoss > 0 ? (riskMetrics.avgWin / riskMetrics.avgLoss).toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly P&L</span>
              <span className={`font-semibold ${riskMetrics.monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${riskMetrics.monthlyPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Max Drawdown</span>
              <span className="font-semibold text-red-600">${riskMetrics.maxDrawdown.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sharpe Ratio</span>
              <span className="font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'green' | 'red' | 'blue' | 'purple' | 'yellow';
  subtitle: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );
}
