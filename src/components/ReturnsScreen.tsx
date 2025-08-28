import React, { useState } from 'react';
import { RotateCcw, Search, Calendar, User, Receipt, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ReturnsScreen() {
  const { sales, returns, processReturn, getSaleById } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<{[key: string]: number}>({});
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  const completedSales = sales.filter(sale => 
    sale.status === 'completed' || sale.status === 'partially_returned'
  );

  const filteredSales = completedSales.filter(sale =>
    sale.id.includes(searchTerm) ||
    sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} جنيه`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReturnQuantityChange = (productId: string, quantity: number) => {
    setReturnItems(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const getMaxReturnQuantity = (item: any) => {
    if (!selectedSale) return 0;
    
    const alreadyReturned = returns
      .filter(returnInv => returnInv.originalSaleId === selectedSale.id)
      .reduce((total, returnInv) => {
        const returnedItem = returnInv.items.find(ri => ri.productId === item.product.id);
        return total + (returnedItem ? returnedItem.returnedQuantity : 0);
      }, 0);
    
    return item.quantity - alreadyReturned;
  };

  const handleProcessReturn = () => {
    if (!selectedSale || !returnReason.trim()) return;

    const returnItemsArray = Object.entries(returnItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (returnItemsArray.length === 0) return;

    try {
      processReturn(selectedSale.id, returnItemsArray, returnReason);
      setSelectedSale(null);
      setReturnItems({});
      setReturnReason('');
      setShowReturnForm(false);
    } catch (error) {
      alert('حدث خطأ أثناء معالجة المرتجع');
    }
  };

  const getTotalReturnAmount = () => {
    if (!selectedSale) return 0;
    
    return Object.entries(returnItems).reduce((total, [productId, quantity]) => {
      const item = selectedSale.items.find((item: any) => item.product.id === productId);
      return total + (item ? item.product.price * quantity : 0);
    }, 0);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <RotateCcw className="w-8 h-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المرتجعات</h1>
          <p className="text-gray-600">معالجة مرتجعات المبيعات</p>
        </div>
      </div>

      {!showReturnForm ? (
        <>
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث برقم الفاتورة أو اسم الكاشير"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sales List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">المبيعات المكتملة</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم الفاتورة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الكاشير</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجمالي</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-blue-600">#{sale.id}</td>
                      <td className="py-4 px-4">{formatDate(sale.timestamp)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {sale.cashierName}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-green-600">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status === 'completed' ? 'مكتمل' : 'مرتجع جزئي'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowReturnForm(true);
                          }}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <RotateCcw className="w-4 h-4" />
                          إرجاع
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد مبيعات</p>
                </div>
              )}
            </div>
          </div>

          {/* Returns History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">سجل المرتجعات</h2>
            
            <div className="space-y-4">
              {returns.length === 0 ? (
                <div className="text-center py-12">
                  <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد مرتجعات</p>
                </div>
              ) : (
                returns.map((returnInv) => (
                  <div key={returnInv.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">مرتجع #{returnInv.id}</h4>
                        <p className="text-sm text-gray-600">
                          من الفاتورة #{returnInv.originalSaleId}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(returnInv.timestamp)}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-red-600">{formatCurrency(returnInv.totalAmount)}</p>
                        <p className="text-sm text-gray-600">{returnInv.cashierName}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>السبب:</strong> {returnInv.reason}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {returnInv.items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>{item.productName} × {item.returnedQuantity}</span>
                          <span>{formatCurrency(item.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Return Form */
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setShowReturnForm(false);
                setSelectedSale(null);
                setReturnItems({});
                setReturnReason('');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              إرجاع الفاتورة #{selectedSale?.id}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sale Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الفاتورة</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">التاريخ:</span>
                    <span>{formatDate(selectedSale?.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الكاشير:</span>
                    <span>{selectedSale?.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإجمالي:</span>
                    <span className="font-semibold">{formatCurrency(selectedSale?.total)}</span>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-gray-800 mb-3">المنتجات:</h4>
              <div className="space-y-3">
                {selectedSale?.items.map((item: any) => {
                  const maxReturn = getMaxReturnQuantity(item);
                  return (
                    <div key={item.product.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">
                            الكمية الأصلية: {item.quantity} | متاح للإرجاع: {maxReturn}
                          </p>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(item.product.price)}
                        </span>
                      </div>
                      
                      {maxReturn > 0 && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">كمية الإرجاع:</label>
                          <input
                            type="number"
                            min="0"
                            max={maxReturn}
                            value={returnItems[item.product.id] || 0}
                            onChange={(e) => handleReturnQuantityChange(item.product.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ملخص الإرجاع</h3>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-orange-600 mb-1">إجمالي المبلغ المرتجع</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(getTotalReturnAmount())}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب الإرجاع</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  placeholder="أدخل سبب الإرجاع..."
                  required
                />
              </div>

              <button
                onClick={handleProcessReturn}
                disabled={getTotalReturnAmount() === 0 || !returnReason.trim()}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                تأكيد الإرجاع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}