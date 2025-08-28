export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  quantity: number;
  unit: 'kg' | 'piece';
  minQuantity: number;
  expiryDate?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'visa' | 'mixed';
  paidAmount?: number;
  cashAmount?: number;
  cardAmount?: number;
  change?: number;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  status: 'completed' | 'returned' | 'partially_returned';
  returnedAmount?: number;
}

export interface ReturnInvoiceItem {
  productId: string;
  productName: string;
  originalQuantity: number;
  returnedQuantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ReturnInvoice {
  id: string;
  originalSaleId: string;
  items: ReturnInvoiceItem[];
  totalAmount: number;
  reason: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'cashier';
  name: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'expired' | 'expiring_soon';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DailyReport {
  date: string;
  totalSales: number;
  totalReturns: number;
  netSales: number;
  totalProfit: number;
  transactionCount: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}