import React from 'react';
import { ParkedCart } from '../../types/market';
import { Clock, Play, Trash2, X, ShoppingBag } from 'lucide-react';

interface ParkedCartsModalProps {
  parkedCarts: ParkedCart[];
  onRecall: (cart: ParkedCart) => void;
  onDelete: (cartId: string) => void;
  onClose: () => void;
}

export const ParkedCartsModal: React.FC<ParkedCartsModalProps> = ({
  parkedCarts,
  onRecall,
  onDelete,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Held Register Carts</h3>
              <p className="text-xs text-slate-400">{parkedCarts.length} active paused transaction(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Carts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {parkedCarts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No parked carts right now</p>
              <p className="text-xs text-slate-500">
                You can park an active checkout anytime by clicking "Hold Cart" in POS.
              </p>
            </div>
          ) : (
            parkedCarts.map((cart) => {
              const totalAmount = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
              const itemCount = cart.items.reduce((sum, item) => sum + (item.weightKg ? 1 : item.quantity), 0);

              return (
                <div
                  key={cart.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{cart.label}</span>
                      <span className="text-[11px] font-mono text-slate-400">· {cart.parkedAt}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{itemCount} item(s)</span>
                      <span>·</span>
                      <span className="font-mono font-medium text-emerald-400">${totalAmount.toFixed(2)}</span>
                      {cart.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-400 truncate max-w-[150px]">{cart.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDelete(cart.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Discard parked cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onRecall(cart)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-md transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
