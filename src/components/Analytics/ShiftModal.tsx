import React, { useState } from 'react';
import { CashierShift, Transaction } from '../../types/market';
import { ShieldCheck, DollarSign, CreditCard, Receipt, X, Printer, Check } from 'lucide-react';

interface ShiftModalProps {
  shift: CashierShift;
  transactions: Transaction[];
  onClose: () => void;
  onCloseShift: (actualCash: number) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  shift,
  transactions,
  onClose,
  onCloseShift
}) => {
  const [actualCashInput, setActualCashInput] = useState<number>(shift.expectedCash);
  const [isZReportGenerated, setIsZReportGenerated] = useState(false);

  const cashTransactions = transactions.filter(t => t.paymentDetails.method === 'cash');
  const cardTransactions = transactions.filter(t => t.paymentDetails.method === 'card' || t.paymentDetails.method === 'qr_code');

  const cashSalesTotal = cashTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
  const cardSalesTotal = cardTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
  const expectedDrawerCash = shift.startingFloat + cashSalesTotal;
  const discrepancy = actualCashInput - expectedDrawerCash;

  const handlePrintZReport = () => {
    window.print();
  };

  const handleFinalizeZReport = () => {
    onCloseShift(actualCashInput);
    setIsZReportGenerated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Cashier Shift & Drawer Balancing (Z-Report)</h3>
              <p className="text-xs text-slate-400">Register: {shift.registerId} · {shift.cashierName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Key figures grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Starting Drawer Float</span>
              <div className="font-mono font-bold text-lg text-white mt-0.5">
                ${shift.startingFloat.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total Shift Sales</span>
              <div className="font-mono font-bold text-lg text-emerald-400 mt-0.5">
                ${(cashSalesTotal + cardSalesTotal).toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Cash Tender Collected</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                ${cashSalesTotal.toFixed(2)} ({cashTransactions.length} txns)
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Card / Digital Settlement</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                ${cardSalesTotal.toFixed(2)} ({cardTransactions.length} txns)
              </div>
            </div>
          </div>

          {/* Drawer Reconciliation Section */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Expected Drawer Cash:</span>
              <span className="font-mono font-bold text-sm text-white">
                ${expectedDrawerCash.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Actual Counted Cash In Drawer ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Cash Discrepancy (Over / Short):</span>
              <span className={`font-mono font-bold text-sm ${
                discrepancy === 0
                  ? 'text-emerald-400'
                  : discrepancy > 0
                  ? 'text-emerald-300'
                  : 'text-rose-400'
              }`}>
                {discrepancy >= 0 ? `+$${discrepancy.toFixed(2)}` : `-$${Math.abs(discrepancy).toFixed(2)}`}
                {discrepancy === 0 && ' (Balanced)'}
              </span>
            </div>
          </div>

          {isZReportGenerated && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Shift successfully balanced and closed. Z-Report logged to store journal.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={handlePrintZReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Z-Report</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalizeZReport}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Finalize Shift Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
