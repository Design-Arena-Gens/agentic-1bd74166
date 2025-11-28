'use client';

import { useState } from 'react';
import { Trade } from '../types';
import { format } from 'date-fns';
import { Edit, Trash2, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
  onUpdateTrade: (id: string, updates: Partial<Trade>) => void;
  onDeleteTrade: (id: string) => void;
}

export default function TradeHistory({ trades, onUpdateTrade, onDeleteTrade }: TradeHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [exitFormOpen, setExitFormOpen] = useState(false);
  const [exitForm, setExitForm] = useState({
    exitPrice: '',
    exitReason: '',
    lessonsLearned: '',
    mistakes: '',
  });

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return trade.status === filter;
  });

  const handleCloseTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setExitForm({
      exitPrice: trade.exitPrice?.toString() || '',
      exitReason: trade.exitReason || '',
      lessonsLearned: trade.lessonsLearned || '',
      mistakes: trade.mistakes?.join(', ') || '',
    });
    setExitFormOpen(true);
  };

  const handleCloseTrade = () => {
    if (!selectedTrade || !exitForm.exitPrice) {
      alert('Please enter an exit price');
      return;
    }

    const exitPrice = parseFloat(exitForm.exitPrice);
    const entryPrice = selectedTrade.entryPrice;
    const quantity = selectedTrade.quantity;
    const direction = selectedTrade.direction;

    let realizedPnL: number;
    if (direction === 'long') {
      realizedPnL = (exitPrice - entryPrice) * quantity;
    } else {
      realizedPnL = (entryPrice - exitPrice) * quantity;
    }

    const mistakes = exitForm.mistakes
      ? exitForm.mistakes.split(',').map(m => m.trim()).filter(m => m)
      : [];

    onUpdateTrade(selectedTrade.id, {
      status: 'closed',
      exitTime: new Date().toISOString(),
      exitPrice,
      realizedPnL,
      exitReason: exitForm.exitReason,
      lessonsLearned: exitForm.lessonsLearned,
      mistakes,
    });

    setExitFormOpen(false);
    setSelectedTrade(null);
    setExitForm({
      exitPrice: '',
      exitReason: '',
      lessonsLearned: '',
      mistakes: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      onDeleteTrade(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Trade History</h2>

        <div className="flex space-x-2">
          {(['all', 'open', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No trades found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(trade.entryTime), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{trade.symbol}</div>
                      <div className="text-xs text-gray-500">{trade.instrumentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 text-sm ${
                        trade.direction === 'long' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.direction === 'long' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{trade.direction}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.strategy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trade.status === 'closed' ? (
                        <span className={`font-medium ${
                          (trade.realizedPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${trade.realizedPnL?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trade.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : (trade.realizedPnL || 0) >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {trade.status === 'open' && (
                          <button
                            onClick={() => handleCloseTradeClick(trade)}
                            className="text-green-600 hover:text-green-800"
                            title="Close trade"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete trade"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exit Trade Modal */}
      {exitFormOpen && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Close Trade: {selectedTrade.symbol}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="text-gray-600">Entry Price:</span>
                  <span className="ml-2 font-medium">${selectedTrade.entryPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <span className="ml-2 font-medium">{selectedTrade.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Direction:</span>
                  <span className="ml-2 font-medium">{selectedTrade.direction}</span>
                </div>
                <div>
                  <span className="text-gray-600">Strategy:</span>
                  <span className="ml-2 font-medium">{selectedTrade.strategy}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={exitForm.exitPrice}
                  onChange={(e) => setExitForm({ ...exitForm, exitPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>

              {exitForm.exitPrice && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Calculated P&L</div>
                  <div className={`text-2xl font-bold ${
                    ((selectedTrade.direction === 'long'
                      ? parseFloat(exitForm.exitPrice) - selectedTrade.entryPrice
                      : selectedTrade.entryPrice - parseFloat(exitForm.exitPrice)) * selectedTrade.quantity) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    ${((selectedTrade.direction === 'long'
                      ? parseFloat(exitForm.exitPrice) - selectedTrade.entryPrice
                      : selectedTrade.entryPrice - parseFloat(exitForm.exitPrice)) * selectedTrade.quantity).toFixed(2)}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit Reason</label>
                <textarea
                  value={exitForm.exitReason}
                  onChange={(e) => setExitForm({ ...exitForm, exitReason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Why did you exit? Target hit? Stop loss? Changed thesis?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
                <textarea
                  value={exitForm.lessonsLearned}
                  onChange={(e) => setExitForm({ ...exitForm, lessonsLearned: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What did you learn from this trade?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mistakes (comma separated)
                </label>
                <input
                  type="text"
                  value={exitForm.mistakes}
                  onChange={(e) => setExitForm({ ...exitForm, mistakes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Moved stop too early, Didn't follow plan"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setExitFormOpen(false);
                  setSelectedTrade(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTrade}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Close Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
