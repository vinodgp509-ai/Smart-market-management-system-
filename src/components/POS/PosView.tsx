import React, { useState } from 'react';
import { Product, CartItem, Customer, PaymentDetails, Transaction, ParkedCart } from '../../types/market';
import { Search, ScanLine, Scale, Trash2, Plus, Minus, UserCheck, Pause, CreditCard, Sparkles, Tag, ShoppingBag, AlertCircle } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { ProduceScaleModal } from './ProduceScaleModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';

interface PosViewProps {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCustomer: Customer | undefined;
  setSelectedCustomer: (customer: Customer | undefined) => void;
  onCompleteSale: (transaction: Transaction) => void;
  onParkCart: (label: string, notes?: string) => void;
  registerId: string;
  cashierName: string;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  customers,
  cart,
  setCart,
  selectedCustomer,
  setSelectedCustomer,
  onCompleteSale,
  onParkCart,
  registerId,
  cashierName
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Modals state
  const [scaleProduct, setScaleProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [showParkPrompt, setShowParkPrompt] = useState(false);
  const [parkLabel, setParkLabel] = useState('');

  const categories = ['All', 'Produce', 'Bakery', 'Dairy & Eggs', 'Pantry', 'Beverages', 'Frozen & Meat'];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Calculate pricing & totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * (item.weightKg ? item.weightKg : item.quantity)), 0);
  const grandTotalBeforeTax = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountTotal = Math.max(0, subtotal - grandTotalBeforeTax);
  const tax = Number((grandTotalBeforeTax * 0.05).toFixed(2));
  const grandTotal = Number((grandTotalBeforeTax + tax).toFixed(2));

  // Add product to cart helper
  const handleAddProduct = (product: Product, weightKg?: number) => {
    soundEngine.playScanBeep();

    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.product.id === product.id);

      const discountPercent = product.dynamicDiscountPercent || 0;
      const effectiveUnitPrice = discountPercent > 0
        ? product.price * (1 - discountPercent / 100)
        : product.price;

      if (product.weightBased) {
        // If weight based, replace or add new weight
        const wt = weightKg || 1.0;
        if (existingIdx >= 0) {
          const updated = [...prevCart];
          const newWt = Number(((updated[existingIdx].weightKg || 0) + wt).toFixed(2));
          updated[existingIdx] = {
            ...updated[existingIdx],
            weightKg: newWt,
            lineTotal: Number((newWt * effectiveUnitPrice).toFixed(2))
          };
          return updated;
        } else {
          return [
            ...prevCart,
            {
              product,
              quantity: 1,
              weightKg: wt,
              unitPrice: product.price,
              discountPercent,
              finalPrice: effectiveUnitPrice,
              lineTotal: Number((wt * effectiveUnitPrice).toFixed(2))
            }
          ];
        }
      } else {
        // Non-weight based items
        if (existingIdx >= 0) {
          const updated = [...prevCart];
          const newQty = updated[existingIdx].quantity + 1;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            lineTotal: Number((newQty * effectiveUnitPrice).toFixed(2))
          };
          return updated;
        } else {
          return [
            ...prevCart,
            {
              product,
              quantity: 1,
              unitPrice: product.price,
              discountPercent,
              finalPrice: effectiveUnitPrice,
              lineTotal: Number((1 * effectiveUnitPrice).toFixed(2))
            }
          ];
        }
      }
    });
  };

  const handleProductCardClick = (product: Product) => {
    if (product.weightBased) {
      setScaleProduct(product);
    } else {
      handleAddProduct(product);
    }
  };

  // Adjust quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              lineTotal: Number((newQty * item.finalPrice).toFixed(2))
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  // Remove line item
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setSelectedCustomer(undefined);
  };

  // Handle direct barcode search submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.trim().toLowerCase();
    const found = products.find(
      p => p.barcode.toLowerCase() === term || p.sku.toLowerCase() === term
    );

    if (found) {
      if (found.weightBased) {
        setScaleProduct(found);
      } else {
        handleAddProduct(found);
      }
      setBarcodeInput('');
    } else {
      soundEngine.playErrorTone();
    }
  };

  // Finalize transaction from checkout modal
  const handleFinalizeSale = (paymentDetails: PaymentDetails, pointsRedeemed: number) => {
    const receiptNum = `REC-${Date.now().toString().slice(-6)}`;
    const ptsEarned = Math.floor(grandTotal);

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toLocaleString(),
      items: [...cart],
      subtotal,
      discountTotal,
      tax,
      grandTotal: Math.max(0, grandTotal - (pointsRedeemed / 100) * 5),
      paymentDetails,
      cashierName,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      loyaltyPointsEarned: ptsEarned,
      loyaltyPointsUsed: pointsRedeemed,
      registerId
    };

    onCompleteSale(transaction);
    setIsCheckoutOpen(false);
    setCompletedTransaction(transaction);
  };

  const handleParkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkLabel.trim()) return;
    onParkCart(parkLabel.trim());
    setParkLabel('');
    setShowParkPrompt(false);
    setCart([]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT COLUMN: Product Catalog & Quick Scanner (takes 65% width) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
        {/* Top Control Bar: Fast Barcode Scanner input & Category Pills */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Quick Barcode Scanner Form */}
            <form onSubmit={handleBarcodeSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or type Barcode / SKU (e.g. 890123450001 or PROD-APP-01)..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-20 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <ScanLine className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded border border-slate-700"
              >
                Scan Enter
              </button>
            </form>

            {/* Launch Camera Barcode Scanner */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              title="Open Optical Barcode Simulator"
            >
              <ScanLine className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
          </div>

          {/* Search by name & Category Filter row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name..."
                  className="bg-slate-950 border border-slate-700/80 rounded-md pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 w-36 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-100 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-3.5 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
              <ShoppingBag className="w-8 h-8 text-slate-600" />
              <p className="text-sm">No products found matching criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredProducts.map((prod) => {
                const isMarkdown = prod.dynamicDiscountPercent > 0;
                const effectivePrice = isMarkdown
                  ? prod.price * (1 - prod.dynamicDiscountPercent / 100)
                  : prod.price;

                return (
                  <button
                    key={prod.id}
                    onClick={() => handleProductCardClick(prod)}
                    className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg p-2.5 text-left flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden"
                  >
                    {/* Expiry Markdown Flag */}
                    {isMarkdown && (
                      <div className="absolute top-1.5 right-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        <span>-{prod.dynamicDiscountPercent}%</span>
                      </div>
                    )}

                    {/* Image / Graphic Container */}
                    <div className="w-full h-24 rounded bg-slate-950 border border-slate-800/80 mb-2 overflow-hidden relative flex items-center justify-center">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 text-xs">
                          <ShoppingBag className="w-6 h-6 text-slate-600 mb-1" />
                          <span className="text-[10px]">{prod.category}</span>
                        </div>
                      )}

                      {prod.weightBased && (
                        <div className="absolute bottom-1 left-1 bg-slate-900/90 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                          <Scale className="w-2.5 h-2.5" />
                          <span>Weight ({prod.unit})</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{prod.sku}</span>
                        <span className={prod.stock <= prod.minStockThreshold ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </div>

                    {/* Price Block */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        {isMarkdown && (
                          <span className="text-[10px] text-slate-500 line-through mr-1 font-mono">
                            ${prod.price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          ${effectivePrice.toFixed(2)}
                          {prod.weightBased && (
                            <span className="text-[10px] text-slate-400 font-normal">/{prod.unit}</span>
                          )}
                        </span>
                      </div>

                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all">
                        + Add
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart, Customer Loyalty, and Checkout Terminal (takes 35% width) */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-slate-900/70 shrink-0">
        {/* Customer Loyalty bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const cust = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(cust);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 py-1.5 px-2 focus:outline-none focus:border-emerald-500 truncate"
            >
              <option value="">Guest Shopper (No Loyalty)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.loyaltyTier} · {c.points} pts)
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="shrink-0 text-right">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {selectedCustomer.points} pts
              </span>
            </div>
          )}
        </div>

        {/* Cart Item Count & Action Header */}
        <div className="px-3.5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white flex items-center gap-1.5">
            Active Cart
            <span className="font-mono text-emerald-400">({cart.length} items)</span>
          </span>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <>
                <button
                  onClick={() => setShowParkPrompt(true)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                  title="Pause and hold this cart for later"
                >
                  <Pause className="w-3 h-3" />
                  <span>Hold</span>
                </button>

                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                  title="Clear all cart items"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
              <ShoppingBag className="w-8 h-8 text-slate-700" />
              <p className="text-xs">Cart is currently empty</p>
              <p className="text-[11px] text-slate-600 text-center max-w-[200px]">
                Scan barcode or select an item from the shelf catalog
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-white truncate">{item.product.name}</span>
                    {item.discountPercent > 0 && (
                      <span className="text-[9px] font-mono px-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        -{item.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>
                      {item.weightKg
                        ? `${item.weightKg} kg × $${item.finalPrice.toFixed(2)}/kg`
                        : `${item.quantity} × $${item.finalPrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Steppers & Line Total */}
                <div className="flex items-center gap-2.5">
                  {!item.product.weightBased ? (
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1 py-0.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="p-0.5 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold px-1 text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="p-0.5 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setScaleProduct(item.product)}
                      className="text-[10px] font-mono bg-slate-900 border border-slate-800 hover:border-slate-600 px-2 py-1 rounded text-amber-300"
                      title="Adjust Scale Weight"
                    >
                      {item.weightKg} kg
                    </button>
                  )}

                  <div className="text-right min-w-[50px]">
                    <span className="font-mono font-bold text-xs text-white">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Park prompt overlay if open */}
        {showParkPrompt && (
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleParkSubmit} className="space-y-2">
              <label className="text-[11px] font-semibold text-amber-400 block">
                Hold / Park Current Cart
              </label>
              <input
                type="text"
                value={parkLabel}
                onChange={(e) => setParkLabel(e.target.value)}
                placeholder="Cart label (e.g. Customer in Red Coat, Aisle 3)..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowParkPrompt(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!parkLabel.trim()}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded disabled:opacity-50"
                >
                  Hold Cart
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cart Financial Summary & Checkout Action */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Near-Expiry Dynamic Savings</span>
                <span className="font-mono">-${discountTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Tax (5%)</span>
              <span className="font-mono text-slate-200">${tax.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-baseline">
              <span className="font-semibold text-sm text-white">Grand Total</span>
              <span className="font-mono font-extrabold text-2xl text-emerald-400">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay & Finalize (${grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      {scaleProduct && (
        <ProduceScaleModal
          product={scaleProduct}
          onConfirm={(prod, wt) => {
            handleAddProduct(prod, wt);
            setScaleProduct(null);
          }}
          onClose={() => setScaleProduct(null)}
        />
      )}

      {isScannerOpen && (
        <BarcodeScannerModal
          products={products}
          onScan={(prod) => {
            if (prod.weightBased) {
              setScaleProduct(prod);
            } else {
              handleAddProduct(prod);
            }
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          grandTotal={grandTotal}
          subtotal={subtotal}
          tax={tax}
          discountTotal={discountTotal}
          customer={selectedCustomer}
          onComplete={handleFinalizeSale}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {completedTransaction && (
        <ReceiptModal
          transaction={completedTransaction}
          onNewSale={() => {
            setCompletedTransaction(null);
            setCart([]);
            setSelectedCustomer(undefined);
          }}
          onClose={() => {
            setCompletedTransaction(null);
            setCart([]);
            setSelectedCustomer(undefined);
          }}
        />
      )}
    </div>
  );
};
