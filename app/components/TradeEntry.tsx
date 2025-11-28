'use client';

import { useState } from 'react';
import { Trade, Strategy, TradeDirection, InstrumentType, BrokerType } from '../types';
import { Save, AlertCircle } from 'lucide-react';

interface TradeEntryProps {
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  strategies: Strategy[];
}

export default function TradeEntry({ onAddTrade, strategies }: TradeEntryProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'long' as TradeDirection,
    status: 'open' as const,
    instrumentType: 'stocks' as InstrumentType,
    broker: 'IBKR' as BrokerType,
    strategy: strategies.length > 0 ? strategies[0].name : '',
    entryPrice: '',
    quantity: '',
    stopLoss: '',
    takeProfit: '',
    thesis: '',
    setupQuality: '5',
    emotionalState: 'calm',
    marketCondition: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];

    if (!formData.symbol) newErrors.push('Symbol is required');
    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) newErrors.push('Valid entry price is required');
    if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.push('Valid quantity is required');
    if (!formData.thesis) newErrors.push('Trade thesis is required');
    if (!formData.strategy) newErrors.push('Strategy is required');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const trade: Omit<Trade, 'id'> = {
      symbol: formData.symbol.toUpperCase(),
      direction: formData.direction,
      status: formData.status,
      instrumentType: formData.instrumentType,
      broker: formData.broker,
      strategy: formData.strategy,
      entryTime: new Date().toISOString(),
      entryPrice: parseFloat(formData.entryPrice),
      quantity: parseInt(formData.quantity),
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
      thesis: formData.thesis,
      setupQuality: parseInt(formData.setupQuality),
      emotionalState: formData.emotionalState,
      marketCondition: formData.marketCondition,
      tags: [],
    };

    onAddTrade(trade);

    // Reset form
    setFormData({
      symbol: '',
      direction: 'long',
      status: 'open',
      instrumentType: 'stocks',
      broker: 'IBKR',
      strategy: strategies.length > 0 ? strategies[0].name : '',
      entryPrice: '',
      quantity: '',
      stopLoss: '',
      takeProfit: '',
      thesis: '',
      setupQuality: '5',
      emotionalState: 'calm',
      marketCondition: '',
    });
    setErrors([]);

    alert('Trade logged successfully!');
  };

  const riskAmount = formData.entryPrice && formData.quantity && formData.stopLoss
    ? Math.abs(parseFloat(formData.entryPrice) - parseFloat(formData.stopLoss)) * parseInt(formData.quantity)
    : 0;

  const rewardAmount = formData.entryPrice && formData.quantity && formData.takeProfit
    ? Math.abs(parseFloat(formData.takeProfit) - parseFloat(formData.entryPrice)) * parseInt(formData.quantity)
    : 0;

  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Log New Trade</h2>

        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-900">Please fix the following errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol *</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="AAPL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strategy *</label>
              <select
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction *</label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as TradeDirection })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instrument Type *</label>
              <select
                value={formData.instrumentType}
                onChange={(e) => setFormData({ ...formData, instrumentType: e.target.value as InstrumentType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="stocks">Stocks</option>
                <option value="options">Options</option>
                <option value="cfds">CFDs</option>
                <option value="futures">Futures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Broker *</label>
              <select
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value as BrokerType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="IBKR">IBKR</option>
                <option value="Netwealth">Netwealth</option>
                <option value="MetaTrader">MetaTrader</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Position Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="145.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Take Profit</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="160.00"
                />
              </div>
            </div>

            {/* Risk/Reward Display */}
            {riskAmount > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Risk Amount</div>
                    <div className="font-semibold text-red-600">${riskAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Reward Amount</div>
                    <div className="font-semibold text-green-600">${rewardAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">R:R Ratio</div>
                    <div className="font-semibold text-gray-900">{riskRewardRatio.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pre-Trade Analysis */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pre-Trade Analysis</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade Thesis *</label>
                <textarea
                  value={formData.thesis}
                  onChange={(e) => setFormData({ ...formData, thesis: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Why are you taking this trade? What's your edge?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Quality (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.setupQuality}
                    onChange={(e) => setFormData({ ...formData, setupQuality: e.target.value })}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium text-gray-900 mt-2">
                    {formData.setupQuality}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emotional State</label>
                  <select
                    value={formData.emotionalState}
                    onChange={(e) => setFormData({ ...formData, emotionalState: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="calm">Calm</option>
                    <option value="anxious">Anxious</option>
                    <option value="excited">Excited</option>
                    <option value="frustrated">Frustrated</option>
                    <option value="confident">Confident</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Market Condition</label>
                <input
                  type="text"
                  value={formData.marketCondition}
                  onChange={(e) => setFormData({ ...formData, marketCondition: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Trending, Range-bound, Volatile"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Save size={20} />
              <span>Log Trade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
