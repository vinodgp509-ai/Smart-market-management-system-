/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  loadStoredProducts,
  saveStoredProducts,
  loadStoredCustomers,
  saveStoredCustomers,
  loadStoredSensors,
  saveStoredSensors,
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredParkedCarts,
  saveStoredParkedCarts,
  loadStoredShift,
  saveStoredShift,
  loadStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  resetDemoData
} from './utils/storage';
import { Product, Customer, SensorDevice, Transaction, CartItem, ParkedCart, CashierShift, PurchaseOrder } from './types/market';
import { Header } from './components/Header';
import { PosView } from './components/POS/PosView';
import { InventoryView } from './components/Inventory/InventoryView';
import { IoTMonitoringView } from './components/IoT/IoTMonitoringView';
import { CustomerLoyaltyView } from './components/Customers/CustomerLoyaltyView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ParkedCartsModal } from './components/POS/ParkedCartsModal';
import { ShiftModal } from './components/Analytics/ShiftModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'iot' | 'customers' | 'analytics'>('pos');

  // Core Data States
  const [products, setProducts] = useState<Product[]>(loadStoredProducts);
  const [customers, setCustomers] = useState<Customer[]>(loadStoredCustomers);
  const [sensors, setSensors] = useState<SensorDevice[]>(loadStoredSensors);
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>(loadStoredParkedCarts);
  const [shift, setShift] = useState<CashierShift>(loadStoredShift);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(loadStoredPurchaseOrders);

  // Active POS state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  // Global modals
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Persist data updates to LocalStorage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveStoredSensors(sensors);
  }, [sensors]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredParkedCarts(parkedCarts);
  }, [parkedCarts]);

  useEffect(() => {
    saveStoredShift(shift);
  }, [shift]);

  useEffect(() => {
    saveStoredPurchaseOrders(purchaseOrders);
  }, [purchaseOrders]);

  // Complete a sale from POS
  const handleCompleteSale = (newTx: Transaction) => {
    // 1. Decrement inventory stock
    setProducts(prevProducts => {
      const updated = [...prevProducts];
      newTx.items.forEach(cartItem => {
        const pIdx = updated.findIndex(p => p.id === cartItem.product.id);
        if (pIdx >= 0) {
          const qtyToDeduct = cartItem.weightKg ? Math.ceil(cartItem.weightKg) : cartItem.quantity;
          updated[pIdx] = {
            ...updated[pIdx],
            stock: Math.max(0, updated[pIdx].stock - qtyToDeduct)
          };
        }
      });
      return updated;
    });

    // 2. Update customer loyalty points and spend if member attached
    if (newTx.customerId) {
      setCustomers(prevCusts =>
        prevCusts.map(c => {
          if (c.id === newTx.customerId) {
            return {
              ...c,
              points: Math.max(0, c.points - newTx.loyaltyPointsUsed + newTx.loyaltyPointsEarned),
              totalSpent: Number((c.totalSpent + newTx.grandTotal).toFixed(2)),
              visitCount: c.visitCount + 1
            };
          }
          return c;
        })
      );
    }

    // 3. Append transaction to journal
    setTransactions(prev => [newTx, ...prev]);

    // 4. Update current register shift totals
    setShift(prevShift => {
      const isCash = newTx.paymentDetails.method === 'cash';
      const cashAmount = isCash
        ? newTx.grandTotal
        : newTx.paymentDetails.splitDetails?.cashAmount || 0;

      return {
        ...prevShift,
        totalTransactions: prevShift.totalTransactions + 1,
        totalRevenue: Number((prevShift.totalRevenue + newTx.grandTotal).toFixed(2)),
        expectedCash: Number((prevShift.expectedCash + cashAmount).toFixed(2))
      };
    });
  };

  // Park / Hold Cart
  const handleParkCart = (label: string, notes?: string) => {
    if (cart.length === 0) return;
    const newParked: ParkedCart = {
      id: `parked-${Date.now()}`,
      label,
      parkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customerId: selectedCustomer?.id,
      notes
    };
    setParkedCarts(prev => [newParked, ...prev]);
  };

  // Recall / Resume Parked Cart
  const handleRecallCart = (parked: ParkedCart) => {
    setCart(parked.items);
    if (parked.customerId) {
      const cust = customers.find(c => c.id === parked.customerId);
      setSelectedCustomer(cust);
    } else {
      setSelectedCustomer(undefined);
    }
    setParkedCarts(prev => prev.filter(c => c.id !== parked.id));
    setIsParkedModalOpen(false);
    setActiveTab('pos');
  };

  // Delete Parked Cart
  const handleDeleteParkedCart = (cartId: string) => {
    setParkedCarts(prev => prev.filter(c => c.id !== cartId));
  };

  // Receive Purchase Order into inventory
  const handleReceivePO = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.status === 'received') return;

    // Increment product stock
    setProducts(prev => {
      const updated = [...prev];
      po.items.forEach(item => {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            stock: updated[idx].stock + item.quantity
          };
        }
      });
      return updated;
    });

    // Mark PO as received
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === poId ? { ...p, status: 'received' } : p))
    );
  };

  // Create new purchase order
  const handleCreatePO = (supplier: string, itemsList: { productId: string; qty: number }[]) => {
    const poItems = itemsList.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const unitCost = prod?.costPrice || 2.50;
      return {
        productId: item.productId,
        productName: prod?.name || 'Restock Item',
        sku: prod?.sku || 'SKU-RESTOCK',
        quantity: item.qty,
        unitCost,
        totalCost: Number((unitCost * item.qty).toFixed(2))
      };
    });

    const totalAmount = poItems.reduce((sum, i) => sum + i.totalCost, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      supplier,
      status: 'pending',
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      expectedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
      items: poItems,
      totalAmount
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  // Reset to default seed
  const handleResetData = () => {
    if (confirm('Reset AuraMarket to fresh demo data? This resets inventory, transactions, and sensor states.')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + (item.weightKg ? 1 : item.quantity), 0)}
        parkedCount={parkedCarts.length}
        onOpenParkedModal={() => setIsParkedModalOpen(true)}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        registerId={shift.registerId}
        cashierName={shift.cashierName}
        onResetData={handleResetData}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <PosView
            products={products}
            customers={customers}
            cart={cart}
            setCart={setCart}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            onCompleteSale={handleCompleteSale}
            onParkCart={handleParkCart}
            registerId={shift.registerId}
            cashierName={shift.cashierName}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            setProducts={setProducts}
            purchaseOrders={purchaseOrders}
            onReceivePO={handleReceivePO}
            onCreatePO={handleCreatePO}
          />
        )}

        {activeTab === 'iot' && (
          <IoTMonitoringView
            sensors={sensors}
            setSensors={setSensors}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerLoyaltyView
            customers={customers}
            setCustomers={setCustomers}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            shift={shift}
            setShift={setShift}
          />
        )}
      </main>

      {/* Parked Carts Modal */}
      {isParkedModalOpen && (
        <ParkedCartsModal
          parkedCarts={parkedCarts}
          onRecall={handleRecallCart}
          onDelete={handleDeleteParkedCart}
          onClose={() => setIsParkedModalOpen(false)}
        />
      )}

      {/* Shift Balance Modal */}
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
}
