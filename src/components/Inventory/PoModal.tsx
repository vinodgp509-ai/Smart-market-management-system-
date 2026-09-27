import React from 'react';
import { PurchaseOrder, Product } from '../../types/market';
import { Package, CheckCircle2, Clock, X, Plus } from 'lucide-react';

interface PoModalProps {
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onReceivePO: (poId: string) => void;
  onCreatePO: (supplier: string, items: { productId: string; qty: number }[]) => void;
  onClose: () => void;
}

export const PoModal: React.FC<PoModalProps> = ({
  purchaseOrders,
  products,
  onReceivePO,
  onCreatePO,
  onClose
}) => {
  // Low stock products that need restock
  const lowStockItems = products.filter(p => p.stock <= p.minStockThreshold);

  const handleQuickRestockAll = () => {
    if (lowStockItems.length === 0) return;
    const items = lowStockItems.map(p => ({
      productId: p.id,
      qty: Math.max(20, p.minStockThreshold * 2)
    }));
    onCreatePO('Consolidated Distributor Order', items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Supplier Purchase Orders</h3>
              <p className="text-xs text-slate-400">Track shipments, restock orders, and intake deliveries</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick low-stock action banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs">
            <div className="text-amber-300">
              <strong>{lowStockItems.length} product(s)</strong> are currently below safe stock threshold.
            </div>
            <button
              onClick={handleQuickRestockAll}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Automated Restock PO</span>
            </button>
          </div>
        )}

        {/* PO List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No purchase orders found.</div>
          ) : (
            purchaseOrders.map((po) => {
              const isReceived = po.status === 'received';

              return (
                <div
                  key={po.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">{po.poNumber}</span>
                        <span className="text-xs text-slate-400">· {po.supplier}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Created: {po.createdAt} · Expected: {po.expectedDelivery}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                          isReceived
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {po.status}
                      </span>

                      {!isReceived && (
                        <button
                          onClick={() => onReceivePO(po.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Receive & Intake</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-slate-900/60 rounded p-2.5 text-xs divide-y divide-slate-800">
                    {po.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-center text-slate-300">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-slate-500 font-mono text-[10px] ml-2">SKU: {item.sku}</span>
                        </div>
                        <div className="font-mono text-right">
                          <span className="text-white font-semibold">+{item.quantity} units</span>
                          <span className="text-slate-400 text-[11px] ml-2">(${item.totalCost.toFixed(2)})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <span>Total Order Cost:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ${po.totalAmount.toFixed(2)}
                    </span>
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
            className="px-4 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
