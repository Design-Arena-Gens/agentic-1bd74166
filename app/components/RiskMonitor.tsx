'use client';

import { Trade, RiskMetrics } from '../types';
import { AlertTriangle, Shield, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RiskMonitorProps {
  trades: Trade[];
  riskMetrics: RiskMetrics;
}

export default function RiskMonitor({ trades, riskMetrics }: RiskMonitorProps) {
  const openTrades = trades.filter(t => t.status === 'open');

  const riskUtilization = (riskMetrics.dailyRiskUsed / riskMetrics.maxDailyRisk) * 100;

  const tradesWithStopLoss = openTrades.filter(t => t.stopLoss).length;
  const stopLossCompliance = openTrades.length > 0
    ? (tradesWithStopLoss / openTrades.length) * 100
    : 100;

  const getTradeRisk = (trade: Trade) => {
    if (!trade.stopLoss) return 0;
    return Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity;
  };

  const getRiskLevel = (risk: number): { color: string; label: string } => {
    if (risk < 100) return { color: 'bg-green-100 text-green-800', label: 'Low' };
    if (risk < 500) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' };
    return { color: 'bg-red-100 text-red-800', label: 'High' };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Risk Monitor</h2>

      {/* Risk Alerts */}
      <div className="space-y-4">
        {riskUtilization > 80 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Daily Risk Limit Alert</h3>
              <p className="text-sm text-red-700 mt-1">
                You've used {riskUtilization.toFixed(1)}% of your maximum daily risk. Consider closing positions or avoiding new trades.
              </p>
            </div>
          </div>
        )}

        {stopLossCompliance < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">Stop Loss Compliance Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {openTrades.length - tradesWithStopLoss} open position(s) without stop loss. Always protect your capital!
              </p>
            </div>
          </div>
        )}

        {riskMetrics.dailyPnL < -500 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-orange-900">Daily Loss Limit Approaching</h3>
              <p className="text-sm text-orange-700 mt-1">
                You're down ${Math.abs(riskMetrics.dailyPnL).toFixed(2)} today. Consider taking a break and reviewing your strategy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Daily Risk Usage</h3>
            <Shield className="text-primary-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-gray-900">
              ${riskMetrics.dailyRiskUsed.toFixed(2)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  riskUtilization > 80 ? 'bg-red-600' : riskUtilization > 50 ? 'bg-yellow-500' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(riskUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Max: ${riskMetrics.maxDailyRisk.toFixed(0)}</span>
              <span>{riskUtilization.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Stop Loss Compliance</h3>
            <Shield className="text-primary-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-gray-900">
              {stopLossCompliance.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  stopLossCompliance === 100 ? 'bg-green-600' : stopLossCompliance > 80 ? 'bg-yellow-500' : 'bg-red-600'
                }`}
                style={{ width: `${stopLossCompliance}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {tradesWithStopLoss} of {openTrades.length} open positions
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Max Drawdown</h3>
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-red-600">
              ${riskMetrics.maxDrawdown.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Historical maximum loss from peak
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Risk Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Positions Risk</h3>

        {openTrades.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No open positions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stop Loss</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {openTrades.map((trade) => {
                  const risk = getTradeRisk(trade);
                  const riskLevel = getRiskLevel(risk);

                  return (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm ${
                          trade.direction === 'long' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : (
                          <span className="text-red-600 font-medium">Not Set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {trade.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${risk.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {trade.stopLoss ? (
                          <span className={`px-2 py-1 text-xs rounded-full ${riskLevel.color}`}>
                            {riskLevel.label}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Undefined
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management Guidelines</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Never risk more than 1-2% per trade</h4>
              <p className="text-sm text-gray-600 mt-1">
                This ensures that even a string of losses won't significantly impact your capital
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Always use stop losses</h4>
              <p className="text-sm text-gray-600 mt-1">
                Define your exit point before entering a trade, not after
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Limit daily loss to 5% of capital</h4>
              <p className="text-sm text-gray-600 mt-1">
                Stop trading for the day if you hit this threshold to avoid emotional decisions
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Maintain minimum 1.5:1 reward-to-risk ratio</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your potential reward should always exceed your risk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
