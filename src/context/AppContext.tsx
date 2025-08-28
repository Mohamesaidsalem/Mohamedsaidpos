import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Sale, User, ReturnInvoice, InventoryAlert, DailyReport } from '../types';

interface AppContextType {
  // User Management
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Sales
  sales: Sale[];
  completeSale: (paymentMethod: 'cash' | 'visa', discount: number, paidAmount?: number) => Sale;
  getSaleById: (id: string) => Sale | undefined;

  // Returns
  returns: ReturnInvoice[];
  processReturn: (saleId: string, returnItems: Array<{ productId: string, quantity: number }>, reason: string) => ReturnInvoice;

  // Inventory Alerts
  alerts: InventoryAlert[];
  acknowledgeAlert: (alertId: string) => void;
  checkInventoryAlerts: () => void;

  // Reports
  getDailyReport: (date: string) => DailyReport;
  getWeeklyReport: (startDate: string) => DailyReport[];
  getMonthlyReport: (year: number, month: number) => DailyReport[];
  getTopProducts: (days: number) => Array<{ productId: string, productName: string, quantitySold: number, revenue: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'المدير العام' },
  { id: '2', username: 'cashier', password: 'cash123', role: 'cashier', name: 'الكاشير' }
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'أرز أبيض',
    barcode: '1234567890123',
    price: 25.50,
    cost: 20.00,
    quantity: 50,
    unit: 'kg',
    minQuantity: 10,
    expiryDate: '2024-12-31',
    category: 'حبوب',
    image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'زيت طبخ',
    barcode: '2345678901234',
    price: 45.00,
    cost: 35.00,
    quantity: 5,
    unit: 'piece',
    minQuantity: 10,
    expiryDate: '2024-06-30',
    category: 'زيوت',
    image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'سكر أبيض',
    barcode: '3456789012345',
    price: 18.75,
    cost: 15.00,
    quantity: 30,
    unit: 'kg',
    minQuantity: 15,
    category: 'سكريات',
    image: 'https://images.pexels.com/photos/65882/spoon-white-sugar-sweetener-sugar-65882.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'شاي أحمر',
    barcode: '4567890123456',
    price: 12.00,
    cost: 8.50,
    quantity: 0,
    unit: 'piece',
    minQuantity: 10,
    expiryDate: '2025-03-20',
    category: 'مشروبات',
    image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<ReturnInvoice[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('pos_products');
    const savedSales = localStorage.getItem('pos_sales');
    const savedReturns = localStorage.getItem('pos_returns');
    const savedAlerts = localStorage.getItem('pos_alerts');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedReturns) setReturns(JSON.parse(savedReturns));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('pos_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('pos_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check for inventory alerts when products change
  useEffect(() => {
    checkInventoryAlerts();
  }, [products]);

  const login = (username: string, password: string): boolean => {
    const user = defaultUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addToCart = (product: Product) => {
    if (product.quantity === 0) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.quantity) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const maxQuantity = item.product.quantity;
        return { ...item, quantity: Math.min(quantity, maxQuantity) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = (paymentMethod: 'cash' | 'visa', discount: number, paidAmount?: number): Sale => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.14;
    const total = subtotal + tax - discount;

    const sale: Sale = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paidAmount: paymentMethod === 'cash' ? paidAmount : total,
      change: paymentMethod === 'cash' && paidAmount ? Math.max(0, paidAmount - total) : 0,
      timestamp: new Date().toISOString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      status: 'completed'
    };

    // Update product quantities
    setProducts(prev => prev.map(product => {
      const cartItem = cart.find(item => item.product.id === product.id);
      if (cartItem) {
        return { ...product, quantity: product.quantity - cartItem.quantity };
      }
      return product;
    }));

    setSales(prev => [...prev, sale]);
    clearCart();
    return sale;
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };

  const processReturn = (saleId: string, returnItems: Array<{ productId: string, quantity: number }>, reason: string): ReturnInvoice => {
    const originalSale = getSaleById(saleId);
    if (!originalSale) throw new Error('Sale not found');

    const returnInvoiceItems = returnItems.map(returnItem => {
      const originalItem = originalSale.items.find(item => item.product.id === returnItem.productId);
      if (!originalItem) throw new Error('Product not found in original sale');

      return {
        productId: returnItem.productId,
        productName: originalItem.product.name,
        originalQuantity: originalItem.quantity,
        returnedQuantity: returnItem.quantity,
        unitPrice: originalItem.product.price,
        totalAmount: originalItem.product.price * returnItem.quantity
      };
    });

    const totalAmount = returnInvoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);

    const returnInvoice: ReturnInvoice = {
      id: Date.now().toString(),
      originalSaleId: saleId,
      items: returnInvoiceItems,
      totalAmount,
      reason,
      timestamp: new Date().toISOString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || ''
    };

    // Update product quantities (return to stock)
    setProducts(prev => prev.map(product => {
      const returnItem = returnItems.find(item => item.productId === product.id);
      if (returnItem) {
        return { ...product, quantity: product.quantity + returnItem.quantity };
      }
      return product;
    }));

    // Update original sale status
    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const totalReturned = (sale.returnedAmount || 0) + totalAmount;
        const isFullyReturned = totalReturned >= sale.total;
        return {
          ...sale,
          status: isFullyReturned ? 'returned' : 'partially_returned',
          returnedAmount: totalReturned
        };
      }
      return sale;
    }));

    setReturns(prev => [...prev, returnInvoice]);
    return returnInvoice;
  };

  const checkInventoryAlerts = () => {
    const newAlerts: InventoryAlert[] = [];
    const today = new Date();

    products.forEach(product => {
      // Low stock alert
      if (product.quantity <= product.minQuantity) {
        newAlerts.push({
          id: `low_stock_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          type: 'low_stock',
          message: `المنتج "${product.name}" وصل للحد الأدنى (${product.quantity} متبقي)`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Expiry alerts
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
          newAlerts.push({
            id: `expired_${product.id}_${Date.now()}`,
            productId: product.id,
            productName: product.name,
            type: 'expired',
            message: `المنتج "${product.name}" منتهي الصلاحية`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        } else if (daysUntilExpiry <= 7) {
          newAlerts.push({
            id: `expiring_${product.id}_${Date.now()}`,
            productId: product.id,
            productName: product.name,
            type: 'expiring_soon',
            message: `المنتج "${product.name}" سينتهي خلال ${daysUntilExpiry} أيام`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        }
      }
    });

    // Only add new alerts that don't already exist
    setAlerts(prev => {
      const existingAlertKeys = prev.map(alert => `${alert.type}_${alert.productId}`);
      const filteredNewAlerts = newAlerts.filter(alert =>
        !existingAlertKeys.includes(`${alert.type}_${alert.productId}`)
      );
      return [...prev, ...filteredNewAlerts];
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getDailyReport = (date: string): DailyReport => {
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= dayStart && saleDate <= dayEnd && sale.status !== 'returned';
    });

    const dayReturns = returns.filter(returnInv => {
      const returnDate = new Date(returnInv.timestamp);
      return returnDate >= dayStart && returnDate <= dayEnd;
    });

    const totalSales = daySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalReturns = dayReturns.reduce((sum, returnInv) => sum + returnInv.totalAmount, 0);
    const netSales = totalSales - totalReturns;

    // Calculate profit
    const totalProfit = daySales.reduce((profit, sale) => {
      const saleProfit = sale.items.reduce((itemProfit, item) => {
        return itemProfit + ((item.product.price - item.product.cost) * item.quantity);
      }, 0);
      return profit + saleProfit;
    }, 0);

    // Top products
    const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

    daySales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product.id].quantity += item.quantity;
        productSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      date,
      totalSales,
      totalReturns,
      netSales,
      totalProfit,
      transactionCount: daySales.length,
      topProducts
    };
  };

  const getWeeklyReport = (startDate: string): DailyReport[] => {
    const reports: DailyReport[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      reports.push(getDailyReport(date.toISOString().split('T')[0]));
    }

    return reports;
  };

  const getMonthlyReport = (year: number, month: number): DailyReport[] => {
    const reports: DailyReport[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      reports.push(getDailyReport(date.toISOString().split('T')[0]));
    }

    return reports;
  };

  const getTopProducts = (days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentSales = sales.filter(sale =>
      new Date(sale.timestamp) >= startDate && sale.status !== 'returned'
    );

    const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

    recentSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product.id].quantity += item.quantity;
        productSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    return Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    sales,
    completeSale,
    getSaleById,
    returns,
    processReturn,
    alerts,
    acknowledgeAlert,
    checkInventoryAlerts,
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getTopProducts
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}