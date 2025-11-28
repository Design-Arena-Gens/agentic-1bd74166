'use client';

import { useState } from 'react';
import { Strategy, Trade, InstrumentType } from '../types';
import { Plus, Edit, Trash2, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';

interface StrategyManagerProps {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: (strategy: Omit<Strategy, 'id'>) => void;
  onUpdateStrategy: (id: string, updates: Partial<Strategy>) => void;
  onDeleteStrategy: (id: string) => void;
}

export default function StrategyManager({
  strategies,
  trades,
  onAddStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
}: StrategyManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [''],
    timeframe: '',
    instruments: [] as InstrumentType[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || formData.rules.filter(r => r).length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const strategyData = {
      name: formData.name,
      description: formData.description,
      rules: formData.rules.filter(r => r.trim()),
      timeframe: formData.timeframe,
      instruments: formData.instruments,
      active: true,
      performance: { trades: 0, winRate: 0, avgReturn: 0 },
    };

    if (editingStrategy) {
      onUpdateStrategy(editingStrategy.id, strategyData);
    } else {
      onAddStrategy(strategyData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: [''],
      timeframe: '',
      instruments: [],
    });
    setShowForm(false);
    setEditingStrategy(null);
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      rules: strategy.rules,
      timeframe: strategy.timeframe,
      instruments: strategy.instruments,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      onDeleteStrategy(id);
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    onUpdateStrategy(id, { active: !currentStatus });
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ''] });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const removeRule = (index: number) => {
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
  };

  const toggleInstrument = (instrument: InstrumentType) => {
    const instruments = formData.instruments.includes(instrument)
      ? formData.instruments.filter(i => i !== instrument)
      : [...formData.instruments, instrument];
    setFormData({ ...formData, instruments });
  };

  const getStrategyPerformance = (strategyName: string) => {
    const strategyTrades = trades.filter(t => t.strategy === strategyName && t.status === 'closed');
    const wins = strategyTrades.filter(t => (t.realizedPnL || 0) > 0).length;
    const winRate = strategyTrades.length > 0 ? (wins / strategyTrades.length) * 100 : 0;
    const totalPnL = strategyTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const avgReturn = strategyTrades.length > 0 ? totalPnL / strategyTrades.length : 0;

    return { trades: strategyTrades.length, winRate, avgReturn, totalPnL };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Strategy Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Strategy</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingStrategy ? 'Edit Strategy' : 'New Strategy'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Momentum Breakout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                <input
                  type="text"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 15min, 1h, Daily"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the strategy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trading Rules *</label>
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Price breaks above resistance"
                  />
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRule}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Rule
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruments</label>
              <div className="flex flex-wrap gap-2">
                {(['stocks', 'options', 'cfds', 'futures'] as InstrumentType[]).map((instrument) => (
                  <button
                    key={instrument}
                    type="button"
                    onClick={() => toggleInstrument(instrument)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.instruments.includes(instrument)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {instrument}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingStrategy ? 'Update Strategy' : 'Add Strategy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strategies List */}
      <div className="grid grid-cols-1 gap-6">
        {strategies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No strategies defined yet. Add your first strategy to get started!</p>
          </div>
        ) : (
          strategies.map((strategy) => {
            const performance = getStrategyPerformance(strategy.name);

            return (
              <div key={strategy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                      <button
                        onClick={() => toggleActive(strategy.id, strategy.active)}
                        className={`flex items-center space-x-1 text-sm font-medium ${
                          strategy.active ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {strategy.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        <span>{strategy.active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">{strategy.description}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(strategy)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit strategy"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(strategy.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete strategy"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Trading Rules</h4>
                    <ul className="space-y-1">
                      {strategy.rules.map((rule, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-primary-600 mt-1">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-2">
                      {strategy.timeframe && (
                        <div className="text-sm">
                          <span className="text-gray-600">Timeframe:</span>
                          <span className="ml-2 font-medium text-gray-900">{strategy.timeframe}</span>
                        </div>
                      )}
                      {strategy.instruments.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-600">Instruments:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {strategy.instruments.map((instrument) => (
                              <span
                                key={instrument}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {instrument}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Total Trades</div>
                        <div className="text-xl font-bold text-gray-900">{performance.trades}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Win Rate</div>
                        <div className="text-xl font-bold text-gray-900">
                          {performance.winRate.toFixed(0)}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Avg Return</div>
                        <div className={`text-xl font-bold ${
                          performance.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${performance.avgReturn.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Total P&L</div>
                        <div className={`text-xl font-bold ${
                          performance.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${performance.totalPnL.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
