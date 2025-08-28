import React, { useState } from 'react';
import { AlertTriangle, Package, Calendar, TrendingDown, CheckCircle, X, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function InventoryManagement() {
  const { products, alerts, acknowledgeAlert, updateProduct } = useApp();
  const [selectedAlert, setSelectedAlert] = useState<string>('all');

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const expiredProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) <= new Date();
  });
  const expiringSoonProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const expiryDate = new Date(p.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  });

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const filteredAlerts = selectedAlert === 'all' 
    ? unacknowledgedAlerts 
    : unacknowledgedAlerts.filter(alert => alert.type === selectedAlert);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'expired': return <X className="w-5 h-5 text-red-500" />;
      case 'expiring_soon': return <Calendar className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'border-orange-200 bg-orange-50';
      case 'expired': return 'border-red-200 bg-red-50';
      case 'expiring_soon': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-600">مراقبة المخزون والتنبيهات</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">مخزون منخفض</p>
              <p className="text-3xl font-bold text-orange-700">{lowStockProducts.length}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">منتهي الصلاحية</p>
              <p className="text-3xl font-bold text-red-700">{expiredProducts.length}</p>
            </div>
            <X className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">ينتهي قريباً</p>
              <p className="text-3xl font-bold text-yellow-700">{expiringSoonProducts.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">إجمالي المنتجات</p>
              <p className="text-3xl font-bold text-blue-700">{products.length}</p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">التنبيهات</h2>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {unacknowledgedAlerts.length}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAlert('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlert === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedAlert('low_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlert === 'low_stock' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              مخزون منخفض
            </button>
            <button
              onClick={() => setSelectedAlert('expired')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlert === 'expired' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              منتهي الصلاحية
            </button>
            <button
              onClick={() => setSelectedAlert('expiring_soon')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlert === 'expiring_soon' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ينتهي قريباً
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد تنبيهات جديدة</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border-2 ${getAlertColor(alert.type)} transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-medium text-gray-800">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-white text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors font-medium"
                  >
                    تم الاطلاع
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Products with Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-bold text-gray-800">منتجات بمخزون منخفض</h3>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد منتجات بمخزون منخفض</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600">#{product.barcode}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                      {product.quantity} متبقي
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      الحد الأدنى: {product.minQuantity}
                    </span>
                    <button
                      onClick={() => {
                        const newQuantity = prompt('أدخل الكمية الجديدة:', product.quantity.toString());
                        if (newQuantity && !isNaN(Number(newQuantity))) {
                          updateProduct(product.id, { quantity: Number(newQuantity) });
                        }
                      }}
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                    >
                      تحديث المخزون
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-800">منتجات تنتهي قريباً</h3>
          </div>

          <div className="space-y-4">
            {[...expiredProducts, ...expiringSoonProducts].length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد منتجات تنتهي قريباً</p>
            ) : (
              [...expiredProducts, ...expiringSoonProducts].map((product) => {
                const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate!);
                const isExpired = daysUntilExpiry <= 0;
                
                return (
                  <div 
                    key={product.id} 
                    className={`p-4 rounded-lg border ${
                      isExpired 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600">#{product.barcode}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        isExpired 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isExpired ? 'منتهي' : `${daysUntilExpiry} أيام`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        تاريخ الانتهاء: {formatDate(product.expiryDate!)}
                      </span>
                      <button
                        onClick={() => {
                          const newDate = prompt('أدخل تاريخ الانتهاء الجديد (YYYY-MM-DD):', product.expiryDate);
                          if (newDate) {
                            updateProduct(product.id, { expiryDate: newDate });
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          isExpired 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        تحديث التاريخ
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}