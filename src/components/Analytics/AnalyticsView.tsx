import React, { useState } from 'react';
import { Transaction, CashierShift } from '../../types/market';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Percent, ShieldCheck, Receipt, Search, Eye } from 'lucide-react';
import { ReceiptModal } from '../POS/ReceiptModal';
import { ShiftModal } from './ShiftModal';

interface AnalyticsViewProps {
  transactions: Transaction[];
  shift: CashierShift;
  setShift: React.Dispatch<React.SetStateAction<CashierShift>>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  shift,
  setShift
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [searchTx, setSearchTx] = useState('');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Financial calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + t.grandTotal, 0);
  const totalDiscounts = transactions.reduce((sum, t) => sum + t.discountTotal, 0);
  const totalTransactions = transactions.length;
  const avgBasketSize = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Compute estimated COGS and Net Profit margin
  const totalCost = transactions.reduce((sum, t) => {
    return sum + t.items.reduce((iSum, item) => iSum + (item.product.costPrice * (item.weightKg || item.quantity)), 0);
  }, 0);
  const netProfit = Math.max(0, totalRevenue - totalCost);
  const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      const cat = item.product.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.lineTotal;
    });
  });

  const categories = Object.keys(categoryTotals);
  const maxCategoryVal = Math.max(...Object.values(categoryTotals), 1);

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    return (
      t.receiptNumber.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.cashierName.toLowerCase().includes(searchTx.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTx.toLowerCase())) ||
      t.paymentDetails.method.toLowerCase().includes(searchTx.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Financial Intelligence & Shift Balancing</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live gross revenue, net margin analytics, shrinkage prevention, and end-of-shift cash drawer audits
            </p>
          </div>

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Reconcile Shift & Z-Report</span>
          </button>
        </div>

        {/* 4 Primary KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Gross Sales Revenue</div>
            <div className="font-mono font-bold text-2xl text-emerald-400 mt-1 tabular-nums">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{totalTransactions} completed transactions</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Estimated Net Profit</div>
            <div className="font-mono font-bold text-2xl text-white mt-1 tabular-nums">
              ${netProfit.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
              Margin: {netMarginPercent}% net
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Average Basket Size</div>
            <div className="font-mono font-bold text-2xl text-white mt-1 tabular-nums">
              ${avgBasketSize.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Per shopper checkout</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Dynamic Markdown Food Saved</div>
            <div className="font-mono font-bold text-2xl text-rose-400 mt-1 tabular-nums">
              ${totalDiscounts.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Near-expiry markdown revenue</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* Category Contribution Chart & Hourly Rush Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category Sales Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm text-white flex items-center justify-between">
              <span>Department Sales Contribution</span>
              <span className="text-xs font-mono text-slate-400">Total: ${totalRevenue.toFixed(2)}</span>
            </h3>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No category sales recorded yet today. Complete checkout sales in the POS tab.
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {categories.map((cat) => {
                  const val = categoryTotals[cat];
                  const percent = Math.round((val / (totalRevenue || 1)) * 100);
                  const barWidth = Math.max(6, Math.round((val / maxCategoryVal) * 100));

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <span className="font-mono text-white font-bold">
                          ${val.toFixed(2)} <span className="text-slate-500 font-normal">({percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peak Shopping Hours simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm text-white flex items-center justify-between">
              <span>Hourly Traffic & Velocity Pattern</span>
              <span className="text-xs font-mono text-slate-400">Store Hours: 07:00 - 22:00</span>
            </h3>

            <div className="pt-2 flex items-end justify-between gap-1 h-36 border-b border-slate-800 pb-2">
              {[
                { hour: '08:00', vol: 25 },
                { hour: '10:00', vol: 55 },
                { hour: '12:00', vol: 85 }, // Lunch rush
                { hour: '14:00', vol: 40 },
                { hour: '16:00', vol: 70 },
                { hour: '18:00', vol: 98 }, // Peak evening
                { hour: '20:00', vol: 50 },
                { hour: '21:00', vol: 20 }
              ].map((slot) => (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-emerald-500/30 hover:bg-emerald-500/50 rounded-t transition-all"
                    style={{ height: `${slot.vol}%` }}
                    title={`${slot.hour}: ${slot.vol}% volume`}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{slot.hour}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Fastest Checkout Bay: Express Lane 1</span>
              <span>Average Scan Latency: 1.4s / item</span>
            </div>
          </div>
        </div>

        {/* Transaction History Log Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Shift Transaction Journal</span>
              </h3>
              <p className="text-xs text-slate-400">Complete itemized receipts and payment settlement audit</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="Search receipt #, cashier, customer..."
                className="w-64 bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Receipt #</th>
                  <th className="py-2.5 px-3 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3 font-medium">Customer / Loyalty</th>
                  <th className="py-2.5 px-3 font-medium">Items Count</th>
                  <th className="py-2.5 px-3 font-medium">Payment Tender</th>
                  <th className="py-2.5 px-3 font-medium">Grand Total</th>
                  <th className="py-2.5 px-4 font-medium text-right">Reprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No transactions recorded yet in this register session.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        #{tx.receiptNumber}
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {tx.timestamp}
                      </td>

                      <td className="py-3 px-3">
                        {tx.customerName ? (
                          <div>
                            <span className="font-semibold text-slate-200">{tx.customerName}</span>
                            <div className="text-[10px] text-amber-400 font-mono">
                              +{tx.loyaltyPointsEarned} pts earned
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Guest Shopper</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {tx.items.reduce((s, i) => s + (i.weightKg ? 1 : i.quantity), 0)} items
                      </td>

                      <td className="py-3 px-3">
                        <span className="uppercase font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.paymentDetails.method}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ${tx.grandTotal.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="flex items-center gap-1 ml-auto px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected Transaction Thermal Slip Modal */}
      {selectedTx && (
        <ReceiptModal
          transaction={selectedTx}
          onNewSale={() => setSelectedTx(null)}
          onClose={() => setSelectedTx(null)}
        />
      )}

      {/* Cashier Shift Reconciliation Modal */}
      {isShiftModalOpen && (
        <ShiftModal
          shift={shift}
          transactions={transactions}
          onClose={() => setIsShiftModalOpen(false)}
          onCloseShift={(actualCash) => {
            setShift(prev => ({
              ...prev,
              actualCash,
              status: 'closed',
              closedAt: new Date().toLocaleTimeString()
            }));
          }}
        />
      )}
    </div>
  );
};
