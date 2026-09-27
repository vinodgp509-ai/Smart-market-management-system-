export type StorageTemp = 'ambient' | 'chilled' | 'frozen';

export interface Product {
  id: string;
  name: string;
  category: 'Produce' | 'Bakery' | 'Dairy & Eggs' | 'Pantry' | 'Beverages' | 'Frozen & Meat' | 'Household';
  sku: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockThreshold: number;
  unit: 'item' | 'kg' | 'lb' | 'bunch' | 'pack';
  weightBased: boolean;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  aisle: string;
  shelf: string;
  tempRequirement: StorageTemp;
  dynamicDiscountPercent: number; // 0 to 80% markdown for near-expiry
  originalPrice?: number;
  imageUrl?: string;
  supplier: string;
  lastESLSync: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  weightKg?: number;
  unitPrice: number;
  discountPercent: number;
  finalPrice: number;
  lineTotal: number;
}

export type PaymentMethod = 'cash' | 'card' | 'qr_code' | 'split';

export interface PaymentDetails {
  method: PaymentMethod;
  amountTendered?: number;
  changeGiven?: number;
  cardLast4?: string;
  cardType?: string;
  splitDetails?: {
    cashAmount: number;
    cardAmount: number;
  };
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  grandTotal: number;
  paymentDetails: PaymentDetails;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  registerId: string;
}

export interface ParkedCart {
  id: string;
  label: string;
  parkedAt: string;
  items: CartItem[];
  customerId?: string;
  notes?: string;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP Platinum';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyTier: LoyaltyTier;
  points: number;
  totalSpent: number;
  visitCount: number;
  joinedDate: string;
  notes?: string;
}

export interface SensorDevice {
  id: string;
  name: string;
  location: string;
  type: 'cold_chain' | 'smart_shelf' | 'ambient';
  currentTemp?: number; // in °C
  targetTemp?: number;
  minSafeTemp?: number;
  maxSafeTemp?: number;
  humidity?: number; // %
  shelfWeightKg?: number;
  shelfCapacityKg?: number;
  status: 'nominal' | 'warning' | 'alert';
  lastTelemetry: string;
  batteryLevel?: number; // %
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  createdAt: string;
  expectedDelivery: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalAmount: number;
}

export interface CashierShift {
  id: string;
  registerId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startingFloat: number;
  status: 'open' | 'closed';
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  totalTransactions: number;
  totalRevenue: number;
}
