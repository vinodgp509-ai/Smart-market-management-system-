import React, { useState } from 'react';
import { Customer, PaymentDetails, PaymentMethod } from '../../types/market';
import { CreditCard, Banknote, QrCode, Split, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface CheckoutModalProps {
  grandTotal: number;
  subtotal: number;
  tax: number;
  discountTotal: number;
  customer?: Customer;
  onComplete: (paymentDetails: PaymentDetails, pointsRedeemed: number) => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  grandTotal,
  subtotal,
  tax,
  discountTotal,
  customer,
  onComplete,
  onClose
}) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [tenderedAmount, setTenderedAmount] = useState<number>(Math.ceil(grandTotal));
  const [cardProcessing, setCardProcessing] = useState(false);
  const [splitCash, setSplitCash] = useState<number>(Math.floor(grandTotal / 2));
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Loyalty points discount calculation: 100 points = $5.00 discount
  const availablePoints = customer?.points || 0;
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(grandTotal / 5) * 100);
  const pointsDiscount = redeemPoints && maxRedeemablePoints >= 100 ? (maxRedeemablePoints / 100) * 5.0 : 0;
  const adjustedTotal = Math.max(0, grandTotal - pointsDiscount);

  const changeDue = Math.max(0, tenderedAmount - adjustedTotal);
  const splitCardDue = Math.max(0, adjustedTotal - splitCash);

  const handleCashTenderPreset = (amount: number) => {
    setTenderedAmount(amount);
  };

  const handleProcessCard = () => {
    setCardProcessing(true);
    setTimeout(() => {
      setCardProcessing(false);
      soundEngine.playSuccessChime();
      onComplete(
        {
          method: 'card',
          cardLast4: '4829',
          cardType: 'Visa Contactless'
        },
        redeemPoints ? maxRedeemablePoints : 0
      );
    }, 1200);
  };

  const handleFinishCash = () => {
    if (tenderedAmount < adjustedTotal) {
      soundEngine.playErrorTone();
      return;
    }
    soundEngine.playSuccessChime();
    onComplete(
      {
        method: 'cash',
        amountTendered: tenderedAmount,
        changeGiven: changeDue
      },
      redeemPoints ? maxRedeemablePoints : 0
    );
  };

  const handleFinishQR = () => {
    soundEngine.playSuccessChime();
    onComplete(
      {
        method: 'qr_code'
      },
      redeemPoints ? maxRedeemablePoints : 0
    );
  };

  const handleFinishSplit = () => {
    soundEngine.playSuccessChime();
    onComplete(
      {
        method: 'split',
        splitDetails: {
          cashAmount: splitCash,
          cardAmount: splitCardDue
        }
      },
      redeemPoints ? maxRedeemablePoints : 0
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="font-semibold text-base text-white">Payment Checkout</h3>
            <p className="text-xs text-slate-400">Select tender method to finalize transaction</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Payable</div>
            <div className="font-mono font-bold text-3xl text-emerald-400 tabular-nums">
              ${adjustedTotal.toFixed(2)}
            </div>
            {pointsDiscount > 0 && (
              <span className="text-[11px] text-amber-400 font-medium">
                (Includes -${pointsDiscount.toFixed(2)} loyalty discount)
              </span>
            )}
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <div>Subtotal: <span className="text-slate-200 font-mono">${subtotal.toFixed(2)}</span></div>
            {discountTotal > 0 && (
              <div className="text-emerald-400">Markdown Savings: <span className="font-mono">-${discountTotal.toFixed(2)}</span></div>
            )}
            <div>Tax (5%): <span className="text-slate-200 font-mono">${tax.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Loyalty Points Redemption option */}
        {customer && maxRedeemablePoints >= 100 && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <span className="text-amber-200 font-medium">{customer.name}</span> has{' '}
                <strong className="text-amber-300 font-mono">{customer.points}</strong> loyalty points
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-amber-300">
              <input
                type="checkbox"
                checked={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.checked)}
                className="rounded border-amber-500 text-amber-500 focus:ring-0 w-4 h-4"
              />
              <span>Redeem {maxRedeemablePoints} pts (-${((maxRedeemablePoints / 100) * 5).toFixed(2)})</span>
            </label>
          </div>
        )}

        {/* Payment Method Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                method === 'card'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4 mb-1" />
              <span>Card / NFC</span>
            </button>

            <button
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                method === 'cash'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4 mb-1" />
              <span>Cash</span>
            </button>

            <button
              onClick={() => setMethod('qr_code')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                method === 'qr_code'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 mb-1" />
              <span>QR Mobile</span>
            </button>

            <button
              onClick={() => setMethod('split')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                method === 'split'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-4 h-4 mb-1" />
              <span>Split Tender</span>
            </button>
          </div>
        </div>

        {/* Method Panels */}
        <div className="p-6">
          {method === 'card' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-lg p-5 bg-slate-950/60 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-white">Ready for EMV Chip or Contactless Tap</h4>
                <p className="text-xs text-slate-400 mt-1">Tap phone or insert card into pinpad terminal</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypted 256-bit Terminal Live</span>
                </div>
              </div>

              <button
                onClick={handleProcessCard}
                disabled={cardProcessing}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {cardProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authorizing EMV Card...
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Authorize Card (${adjustedTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {method === 'cash' && (
            <div className="space-y-4">
              {/* Tender Presets */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Quick Cash Denominations</label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCashTenderPreset(Math.ceil(adjustedTotal))}
                    className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-mono font-medium"
                  >
                    Exact
                  </button>
                  {[10, 20, 50, 100].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => handleCashTenderPreset(bill)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-mono font-medium"
                    >
                      ${bill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tender input & Change calculation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">CASH TENDERED</label>
                  <div className="flex items-center text-lg font-mono text-white">
                    <span className="text-slate-500 mr-1">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">CHANGE DUE</label>
                  <div className={`text-lg font-mono font-bold ${changeDue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${changeDue.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishCash}
                disabled={tenderedAmount < adjustedTotal}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Complete Cash Sale</span>
              </button>
            </div>
          )}

          {method === 'qr_code' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-center justify-center">
                {/* SVG QR Code Simulation */}
                <div className="bg-white p-3 rounded-lg shadow-inner mb-3">
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h30v30H0zM5 5h20v20H5zM70 0h30v30H70zM75 5h20v20H75zM0 70h30v30H0zM5 75h20v20H5z" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="80" y="10" width="10" height="10" />
                    <rect x="10" y="80" width="10" height="10" />
                    <rect x="35" y="10" width="10" height="10" />
                    <rect x="50" y="15" width="15" height="5" />
                    <rect x="40" y="35" width="20" height="20" />
                    <rect x="70" y="45" width="15" height="10" />
                    <rect x="45" y="70" width="25" height="10" />
                    <rect x="80" y="75" width="10" height="20" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-slate-200">Scan to Pay with Mobile Wallet</div>
                <div className="text-[11px] text-slate-400">Apple Pay · Google Wallet · UPI · Bank App</div>
              </div>

              <button
                onClick={handleFinishQR}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm QR Payment (${adjustedTotal.toFixed(2)})</span>
              </button>
            </div>
          )}

          {method === 'split' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Bill:</span>
                  <span className="font-mono font-bold text-white">${adjustedTotal.toFixed(2)}</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Part 1: Cash Amount</span>
                    <span className="font-mono font-semibold">${splitCash.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={adjustedTotal}
                    step="0.5"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Part 2: Remaining on Card:</span>
                  <span className="font-mono font-bold text-emerald-400">${splitCardDue.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleFinishSplit}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Complete Split Tender</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
