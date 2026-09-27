import React, { useState } from 'react';
import { Product, PurchaseOrder } from '../../types/market';
import { Search, Plus, Radio, ArrowUpDown, Tag, AlertTriangle, Check, RefreshCw, Sparkles, Package, ExternalLink, Calendar } from 'lucide-react';
import { AddProductModal } from './AddProductModal';
import { PoModal } from './PoModal';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  purchaseOrders: PurchaseOrder[];
  onReceivePO: (poId: string) => void;
  onCreatePO: (supplier: string, items: { productId: string; qty: number }[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  setProducts,
  purchaseOrders,
  onReceivePO,
  onCreatePO
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'expiring' | 'discounted'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPoOpen, setIsPoOpen] = useState(false);
  const [isSyncingESL, setIsSyncingESL] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const categories = ['All', 'Produce', 'Bakery', 'Dairy & Eggs', 'Pantry', 'Beverages', 'Frozen & Meat', 'Household'];

  // Today reference date: 2026-09-27
  const todayMs = new Date('2026-09-27').getTime();

  // Helper to get days until expiry
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const expiryMs = new Date(expiryDateStr).getTime();
    return Math.ceil((expiryMs - todayMs) / (1000 * 60 * 60 * 24));
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.aisle.toLowerCase().includes(searchQuery.toLowerCase());

    const daysLeft = getDaysUntilExpiry(p.expiryDate);
    const isLowStock = p.stock <= p.minStockThreshold;
    const isExpiring = daysLeft <= 3 && daysLeft >= 0;
    const isDiscounted = p.dynamicDiscountPercent > 0;

    let matchesStatus = true;
    if (statusFilter === 'low_stock') matchesStatus = isLowStock;
    if (statusFilter === 'expiring') matchesStatus = isExpiring;
    if (statusFilter === 'discounted') matchesStatus = isDiscounted;

    return matchesCat && matchesSearch && matchesStatus;
  });

  // Calculate high-level inventory metrics
  const totalValuationCost = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalValuationRetail = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold).length;
  const expiringCount = products.filter(p => {
    const d = getDaysUntilExpiry(p.expiryDate);
    return d <= 3 && d >= 0;
  }).length;
  const discountedCount = products.filter(p => p.dynamicDiscountPercent > 0).length;

  // Dynamic Expiry Markdown Optimization Engine
  const handleApplySmartMarkdowns = () => {
    setProducts(prev =>
      prev.map(p => {
        const daysLeft = getDaysUntilExpiry(p.expiryDate);
        let discount = p.dynamicDiscountPercent;

        if (daysLeft <= 1) {
          discount = 40; // 40% off expiring tomorrow or today
        } else if (daysLeft <= 2) {
          discount = 25; // 25% off expiring in 2 days
        } else if (daysLeft <= 3) {
          discount = 15; // 15% off expiring in 3 days
        }

        return {
          ...p,
          dynamicDiscountPercent: discount,
          lastESLSync: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      })
    );

    setSyncNotice('Dynamic markdowns computed and queued for Electronic Shelf Labels!');
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // Electronic Shelf Label (ESL) batch broadcast
  const handleBroadcastESL = () => {
    setIsSyncingESL(true);
    setTimeout(() => {
      setProducts(prev =>
        prev.map(p => ({
          ...p,
          lastESLSync: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }))
      );
      setIsSyncingESL(false);
      setSyncNotice(`Broadcast success: ${products.length} e-ink digital shelf tags synced over 2.4GHz RF network.`);
      setTimeout(() => setSyncNotice(null), 4000);
    }, 1400);
  };

  // Quick stock adjuster
  const handleStockDelta = (productId: string, delta: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: Math.max(0, p.stock + delta)
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Banner / KPIs */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Inventory Control & Electronic Shelf Labels (ESL)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RF Sync Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated expiration markdown automation, live stock tracking, and supplier restock procurement
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleApplySmartMarkdowns}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Dynamic Markdowns</span>
            </button>

            <button
              onClick={handleBroadcastESL}
              disabled={isSyncingESL}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Radio className={`w-3.5 h-3.5 ${isSyncingESL ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
              <span>{isSyncingESL ? 'Broadcasting RF...' : 'Sync Digital Shelf Tags'}</span>
            </button>

            <button
              onClick={() => setIsPoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Purchase Orders ({purchaseOrders.length})</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New SKU</span>
            </button>
          </div>
        </div>

        {/* Sync notification banner */}
        {syncNotice && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total Inventory Value</div>
            <div className="font-mono font-bold text-lg text-white mt-1 tabular-nums">
              ${totalValuationCost.toFixed(2)}
              <span className="text-[10px] text-slate-500 font-normal ml-1">cost</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              Retail Potential: ${totalValuationRetail.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Active Catalog SKUs</div>
            <div className="font-mono font-bold text-lg text-white mt-1 tabular-nums">
              {products.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across {categories.length - 1} departments</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Low Stock Alerts</div>
            <div className="font-mono font-bold text-lg text-amber-400 mt-1 tabular-nums">
              {lowStockCount} items
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Below reorder threshold</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Near-Expiry Markdowns</div>
            <div className="font-mono font-bold text-lg text-rose-400 mt-1 tabular-nums">
              {expiringCount} expiring soon
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{discountedCount} currently on dynamic discount</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, barcode, aisle..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'low_stock'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter('expiring')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'expiring'
                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expiring ≤3d ({expiringCount})
            </button>
            <button
              onClick={() => setStatusFilter('discounted')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'discounted'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Discounted ({discountedCount})
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none shrink-0"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-medium">Product / SKU</th>
              <th className="py-2.5 px-3 font-medium">Category & Location</th>
              <th className="py-2.5 px-3 font-medium">Expiry / Freshness</th>
              <th className="py-2.5 px-3 font-medium">Stock Level</th>
              <th className="py-2.5 px-3 font-medium">Pricing & Margin</th>
              <th className="py-2.5 px-3 font-medium">Dynamic Markdown</th>
              <th className="py-2.5 px-3 font-medium">Digital Tag (ESL)</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredProducts.map((prod) => {
              const daysLeft = getDaysUntilExpiry(prod.expiryDate);
              const isLowStock = prod.stock <= prod.minStockThreshold;
              const marginPercent = Math.round(((prod.price - prod.costPrice) / prod.price) * 100);
              const isMarkdown = prod.dynamicDiscountPercent > 0;
              const effectivePrice = isMarkdown
                ? prod.price * (1 - prod.dynamicDiscountPercent / 100)
                : prod.price;

              return (
                <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                  {/* Product & SKU */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-slate-950 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">SKU</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{prod.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {prod.sku} · {prod.barcode}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Location */}
                  <td className="py-3 px-3">
                    <div className="text-slate-200">{prod.category}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {prod.aisle} · {prod.shelf}
                    </div>
                  </td>

                  {/* Expiry */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-200">{prod.expiryDate}</span>
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {daysLeft < 0 ? (
                        <span className="text-rose-400 font-bold">Expired</span>
                      ) : daysLeft <= 2 ? (
                        <span className="text-rose-400 font-semibold">{daysLeft} day(s) left</span>
                      ) : daysLeft <= 5 ? (
                        <span className="text-amber-400">{daysLeft} days left</span>
                      ) : (
                        <span className="text-slate-500">{daysLeft} days</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-bold text-sm text-white">
                        {prod.stock} {prod.unit}
                      </div>
                      {isLowStock && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Min Threshold: {prod.minStockThreshold}
                    </div>
                  </td>

                  {/* Pricing & Margin */}
                  <td className="py-3 px-3">
                    <div className="font-mono text-white font-semibold">
                      ${effectivePrice.toFixed(2)}
                      {isMarkdown && (
                        <span className="text-[10px] text-slate-500 line-through ml-1 font-normal">
                          ${prod.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Cost: ${prod.costPrice.toFixed(2)} · Margin: {marginPercent}%
                    </div>
                  </td>

                  {/* Dynamic Markdown */}
                  <td className="py-3 px-3">
                    {isMarkdown ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          -{prod.dynamicDiscountPercent}%
                        </span>
                        <button
                          onClick={() => {
                            setProducts(prev =>
                              prev.map(p => p.id === prod.id ? { ...p, dynamicDiscountPercent: 0 } : p)
                            );
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">Standard</span>
                    )}
                  </td>

                  {/* Electronic Shelf Label status */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Synced</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {prod.lastESLSync.slice(11)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleStockDelta(prod.id, -1)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                        title="Reduce stock by 1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleStockDelta(prod.id, 5)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-mono"
                        title="Add 5 units to stock"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isAddOpen && (
        <AddProductModal
          onAdd={(newProduct) => setProducts(prev => [newProduct, ...prev])}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {isPoOpen && (
        <PoModal
          purchaseOrders={purchaseOrders}
          products={products}
          onReceivePO={onReceivePO}
          onCreatePO={onCreatePO}
          onClose={() => setIsPoOpen(false)}
        />
      )}
    </div>
  );
};
