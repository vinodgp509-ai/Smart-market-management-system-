import React from 'react';
import { Transaction } from '../../types/market';
import { Printer, Check, X, ArrowRight, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  onNewSale: () => void;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onNewSale,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100 flex flex-col max-h-[95vh]">
        {/* Header bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Sale Finalized Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950/70 flex justify-center">
          {/* Authentic 80mm thermal slip */}
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-slate-950 p-5 rounded-lg shadow-md font-mono text-xs select-text leading-tight"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="font-bold text-base tracking-wider uppercase">AURAMARKET</h2>
              <p className="text-[11px] text-slate-600">SMART GROCERY & FRESH DEPOT</p>
              <p className="text-[10px] text-slate-500">742 Evergreen Way, Suite 100</p>
              <p className="text-[10px] text-slate-500">Tel: (555) 019-4820 · Tax ID: 94-820194</p>
            </div>

            {/* Transaction Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Receipt: #{transaction.receiptNumber}</span>
                <span>Reg: {transaction.registerId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {transaction.timestamp}</span>
                <span>Op: {transaction.cashierName.split(' ')[0]}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between font-semibold pt-0.5 text-slate-800">
                  <span>Loyalty Cust: {transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 pb-1 border-b border-slate-200">
                <span>ITEM</span>
                <span>QTY/WT</span>
                <span>TOTAL</span>
              </div>

              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-medium truncate max-w-[170px]">{item.product.name}</span>
                    <span className="font-bold">${item.lineTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pl-1">
                    <span>
                      {item.weightKg
                        ? `${item.weightKg} kg @ $${item.unitPrice.toFixed(2)}/kg`
                        : `${item.quantity}x @ $${item.unitPrice.toFixed(2)}`}
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="text-emerald-700">(-{item.discountPercent}% Off)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Dynamic Savings</span>
                  <span>-${transaction.discountTotal.toFixed(2)}</span>
                </div>
              )}
              {transaction.loyaltyPointsUsed > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Pts ({transaction.loyaltyPointsUsed} pts)</span>
                  <span>-${((transaction.loyaltyPointsUsed / 100) * 5).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (5.0%)</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL</span>
                <span>${transaction.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Tender breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="uppercase">Paid via: {transaction.paymentDetails.method}</span>
                {transaction.paymentDetails.cardLast4 && (
                  <span>**** {transaction.paymentDetails.cardLast4}</span>
                )}
              </div>
              {transaction.paymentDetails.amountTendered !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>${transaction.paymentDetails.amountTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Due:</span>
                    <span>${(transaction.paymentDetails.changeGiven || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Loyalty points summary */}
            {transaction.loyaltyPointsEarned > 0 && (
              <div className="py-2 text-center bg-slate-100 rounded text-[10px] my-2 text-slate-700">
                ★ <strong>+{transaction.loyaltyPointsEarned} Points</strong> Earned On This Purchase!
              </div>
            )}

            {/* Barcode Graphic Simulation */}
            <div className="pt-3 text-center">
              <div className="h-9 flex items-center justify-center gap-[2px] bg-slate-100 p-1">
                {[2, 1, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 4].map((width, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: `${width * 1.5}px` }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-1 tracking-widest">{transaction.receiptNumber}</p>
              <p className="text-[10px] text-slate-600 mt-2 font-semibold">THANK YOU FOR SHOPPING FRESH!</p>
              <p className="text-[9px] text-slate-400">Keep receipt for 14-day quality guarantee</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onNewSale}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-sm"
          >
            <span>Next Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
