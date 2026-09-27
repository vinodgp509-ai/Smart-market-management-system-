import { Product, Customer, SensorDevice, Transaction, ParkedCart, CashierShift, PurchaseOrder } from '../types/market';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SENSORS, INITIAL_SHIFT, INITIAL_PURCHASE_ORDERS } from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'auramarket_products_v1',
  CUSTOMERS: 'auramarket_customers_v1',
  SENSORS: 'auramarket_sensors_v1',
  TRANSACTIONS: 'auramarket_transactions_v1',
  PARKED_CARTS: 'auramarket_parked_carts_v1',
  CURRENT_SHIFT: 'auramarket_current_shift_v1',
  PURCHASE_ORDERS: 'auramarket_pos_v1'
};

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products from storage:', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

export function loadStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers from storage:', e);
  }
  return INITIAL_CUSTOMERS;
}

export function saveStoredCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers:', e);
  }
}

export function loadStoredSensors(): SensorDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENSORS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sensors:', e);
  }
  return INITIAL_SENSORS;
}

export function saveStoredSensors(sensors: SensorDevice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SENSORS, JSON.stringify(sensors));
  } catch (e) {
    console.error('Failed to save sensors:', e);
  }
}

export function loadStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions:', e);
  }
  return [];
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadStoredParkedCarts(): ParkedCart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARKED_CARTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load parked carts:', e);
  }
  return [];
}

export function saveStoredParkedCarts(carts: ParkedCart[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify(carts));
  } catch (e) {
    console.error('Failed to save parked carts:', e);
  }
}

export function loadStoredShift(): CashierShift {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load shift:', e);
  }
  return INITIAL_SHIFT;
}

export function saveStoredShift(shift: CashierShift): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(shift));
  } catch (e) {
    console.error('Failed to save shift:', e);
  }
}

export function loadStoredPurchaseOrders(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load POs:', e);
  }
  return INITIAL_PURCHASE_ORDERS;
}

export function saveStoredPurchaseOrders(pos: PurchaseOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(pos));
  } catch (e) {
    console.error('Failed to save POs:', e);
  }
}

export function resetDemoData(): void {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.SENSORS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.PARKED_CARTS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SHIFT);
  localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
}
