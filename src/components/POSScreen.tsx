import { useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Receipt, X, Printer, Eye, ArrowLeft, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function POSScreen() {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, completeSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'visa' | 'mixed'>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.14;
  const total = subtotal + tax - discount;
  
  // Calculate change and shortage for cash payment
  const change = (selectedPaymentMethod === 'cash') && paidAmount > total ? paidAmount - total : 0;
  const shortage = (selectedPaymentMethod === 'cash') && paidAmount > 0 && paidAmount < total ? total - paidAmount : 0;

  // Calculate card amount for mixed payment
  const cardAmount = selectedPaymentMethod === 'mixed' ? Math.max(0, total - paidAmount) : 0;

  const handlePaymentMethodSelect = (method: 'cash' | 'visa') => {
    if (method === 'visa') {
      // For Visa, complete sale immediately
      if (cart.length === 0) return;
      const sale = completeSale('visa', discount, total);
      setLastSale(sale);
      setShowReceipt(true);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedPaymentMethod('cash');
    } else if (method === 'cash') {
      setSelectedPaymentMethod('cash');
      setPaidAmount(0);
    }
  };

  const handleMixedPayment = () => {
    setSelectedPaymentMethod('mixed');
    setPaidAmount(0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    if (selectedPaymentMethod === 'cash' && paidAmount < total) {
      alert('المبلغ المدفوع أقل من المطلوب');
      return;
    }
    
    let sale;
    if (selectedPaymentMethod === 'mixed') {
      // For mixed payment, calculate card amount automatically
      const finalCardAmount = Math.max(0, total - paidAmount);
      if (paidAmount > total) {
        alert('المبلغ النقدي أكبر من المطلوب');
        return;
      }
      
      // Create sale with mixed payment details
      const baseSale = completeSale('cash', discount, paidAmount + finalCardAmount);
      sale = {
        ...baseSale,
        paymentMethod: 'mixed',
        cashAmount: paidAmount,
        cardAmount: finalCardAmount,
        paidAmount: paidAmount + finalCardAmount,
        change: 0 // No change in mixed payment
      };
    } else {
      sale = completeSale(selectedPaymentMethod, discount, selectedPaymentMethod === 'cash' ? paidAmount : total);
    }
    
    setLastSale(sale);
    setShowReceipt(true);
    setDiscount(0);
    setPaidAmount(0);
    setSelectedPaymentMethod('cash');
  };

  const addQuickAmount = (amount: number) => {
    const newAmount = paidAmount + amount;
    if (selectedPaymentMethod === 'mixed' && newAmount <= total) {
      setPaidAmount(newAmount);
    } else if (selectedPaymentMethod !== 'mixed') {
      setPaidAmount(newAmount);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastSale) return;
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: center; width: 300px; margin: 0 auto;">
        <h2 style="margin-bottom: 20px;">فاتورة البيع</h2>
        <p>رقم الفاتورة: ${lastSale.id}</p>
        <p>التاريخ: ${new Date(lastSale.timestamp).toLocaleString('ar-EG')}</p>
        <p>الكاشير: ${lastSale.cashierName}</p>
        <hr style="margin: 20px 0;">
        
        ${lastSale.items.map((item: any) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>${item.product.name} × ${item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)} جنيه</span>
          </div>
        `).join('')}
        
        <hr style="margin: 20px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span>المجموع الفرعي:</span>
          <span>${lastSale.subtotal.toFixed(2)} جنيه</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>الضريبة:</span>
          <span>${lastSale.tax.toFixed(2)} جنيه</span>
        </div>
        ${lastSale.discount > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>الخصم:</span>
            <span>-${lastSale.discount.toFixed(2)} جنيه</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px;">
          <span>الإجمالي:</span>
          <span>${lastSale.total.toFixed(2)} جنيه</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <span>طريقة الدفع:</span>
          <span>${lastSale.paymentMethod === 'cash' ? 'نقدي' : lastSale.paymentMethod === 'visa' ? 'فيزا' : 'مختلط'}</span>
        </div>
        
        ${lastSale.paymentMethod === 'mixed' ? `
          <div style="display: flex; justify-content: space-between;">
            <span>المبلغ النقدي:</span>
            <span>${(lastSale.cashAmount || 0).toFixed(2)} جنيه</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>المبلغ بالكارت:</span>
            <span>${(lastSale.cardAmount || 0).toFixed(2)} جنيه</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>إجمالي المدفوع:</span>
            <span>${lastSale.paidAmount.toFixed(2)} جنيه</span>
          </div>
        ` : lastSale.paymentMethod === 'cash' && lastSale.paidAmount ? `
          <div style="display: flex; justify-content: space-between;">
            <span>المبلغ المدفوع:</span>
            <span>${lastSale.paidAmount.toFixed(2)} جنيه</span>
          </div>
          ${lastSale.change && lastSale.change > 0 ? `
            <div style="display: flex; justify-content: space-between; color: green; font-weight: bold;">
              <span>الباقي:</span>
              <span>${lastSale.change.toFixed(2)} جنيه</span>
            </div>
          ` : ''}
        ` : ''}
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px;">شكراً لتسوقكم معنا</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>فاتورة البيع</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} جنيه`;
  };

  const getUnitText = (unit: string) => {
    return unit === 'kg' ? 'كيلو' : 'قطعة';
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50" dir="rtl">
      {/* Products Section */}
      <div className="flex-1 p-3 lg:p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">شاشة البيع</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن منتج (الاسم أو الباركود)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white p-2 lg:p-4 rounded-lg lg:rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl cursor-pointer ${
                product.quantity === 0 
                  ? 'border-red-200 bg-red-50 opacity-60' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => product.quantity > 0 && addToCart(product)}
            >
              {/* Product Image */}
              <div className="w-full h-20 lg:h-32 bg-gray-100 rounded-lg mb-2 lg:mb-3 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 lg:w-8 lg:h-8 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start mb-2 lg:mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-xs lg:text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-600 font-mono hidden lg:block">{product.barcode}</p>
                  <p className="text-xs lg:text-sm text-blue-600 bg-blue-100 px-1 lg:px-2 py-0.5 lg:py-1 rounded-full inline-block mt-1">
                    {product.category}
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-2 lg:mb-3 gap-1 lg:gap-0">
                <span className="text-sm lg:text-2xl font-bold text-blue-600">{formatCurrency(product.price)}</span>
                <span className="text-xs lg:text-sm text-gray-600">
                  {product.quantity} {getUnitText(product.unit)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-xs lg:text-sm px-1 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium ${
                  product.quantity > product.minQuantity 
                    ? 'bg-green-100 text-green-800' 
                    : product.quantity > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.quantity > product.minQuantity ? 'متوفر' : product.quantity > 0 ? 'قليل' : 'نفد'}
                </span>
                
                {product.quantity > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="bg-blue-600 text-white p-1 lg:p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm lg:text-lg">لا توجد منتجات تطابق البحث</p>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-white shadow-xl p-3 lg:p-6 flex flex-col max-h-screen lg:max-h-none overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">سلة التسوق</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs lg:text-sm font-medium">
            {cart.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 lg:mb-6 max-h-48 lg:max-h-96 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {cart.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm lg:text-base">السلة فارغة</p>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-gray-50 p-2 lg:p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm lg:text-base line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs lg:text-sm text-gray-600">{formatCurrency(item.product.price)} / {getUnitText(item.product.unit)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-0.5 lg:p-1"
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="bg-gray-200 text-gray-700 p-0.5 lg:p-1 rounded hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                      <span className="font-medium px-2 lg:px-3 text-sm lg:text-base">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="bg-gray-200 text-gray-700 p-0.5 lg:p-1 rounded hover:bg-gray-300 transition-colors"
                        disabled={item.quantity >= item.product.quantity}
                      >
                        <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-blue-600 text-sm lg:text-base">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="space-y-2 mb-3 lg:mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm lg:text-base">المجموع الفرعي:</span>
                <span className="font-medium text-sm lg:text-base">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm lg:text-base">الضريبة (14%):</span>
                <span className="font-medium text-sm lg:text-base">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm lg:text-base">الخصم:</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-16 lg:w-20 px-1 lg:px-2 py-1 border border-gray-300 rounded text-center text-sm lg:text-base"
                  min="0"
                  max={subtotal + tax}
                />
              </div>
              <div className="flex justify-between text-base lg:text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2 lg:space-y-3">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full bg-gray-600 text-white py-2 lg:py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <Eye className="w-4 h-4" />
                معاينة الفاتورة
              </button>
              
              <div className="grid grid-cols-3 gap-1 lg:gap-2">
              <button
                onClick={() => handlePaymentMethodSelect('cash')}
                className="bg-green-600 text-white py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
              >
                <Banknote className="w-3 h-3 lg:w-4 lg:h-4" />
                نقدي
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('visa')}
                className="bg-blue-600 text-white py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <CreditCard className="w-3 h-3 lg:w-4 lg:h-4" />
                فيزا
              </button>
              <button
                onClick={handleMixedPayment}
                className="bg-purple-600 text-white py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
              >
                <div className="flex">
                  <Banknote className="w-2 h-2 lg:w-3 lg:h-3" />
                  <CreditCard className="w-2 h-2 lg:w-3 lg:h-3 -ml-1" />
                </div>
                مختلط
              </button>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200 payment-section">
              <h3 className="text-xs lg:text-sm font-bold text-gray-800 mb-2 lg:mb-3 text-center">
                {selectedPaymentMethod === 'mixed' ? 'الدفع المختلط' : 
                 selectedPaymentMethod === 'visa' ? 'الدفع بالفيزا' : 'الدفع النقدي'}
              </h3>
              
              {selectedPaymentMethod !== 'visa' && (
                <div className="space-y-2 lg:space-y-3">
                  <div>
                    <label className="block text-xs lg:text-xs font-medium text-gray-700 mb-1">
                      {selectedPaymentMethod === 'mixed' ? 'المبلغ النقدي:' : 'المبلغ المدفوع:'}
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm lg:text-base"
                      placeholder={selectedPaymentMethod === 'mixed' ? 'أدخل المبلغ النقدي' : 'أدخل المبلغ المدفوع'}
                      min="0"
                      max={selectedPaymentMethod === 'mixed' ? total : undefined}
                      step="0.01"
                    />
                  </div>

                  {/* Mixed Payment Info */}
                  {selectedPaymentMethod === 'mixed' && (
                    <div className="bg-blue-50 p-2 lg:p-3 rounded-lg border border-blue-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700 text-xs lg:text-sm">المبلغ النقدي:</span>
                          <span className="font-medium text-blue-600 text-xs lg:text-sm">{formatCurrency(paidAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 text-xs lg:text-sm">مبلغ الفيزا:</span>
                          <span className="font-medium text-purple-600 text-xs lg:text-sm">
                            {formatCurrency(cardAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-medium text-xs lg:text-sm">الإجمالي:</span>
                          <span className="font-bold text-green-600 text-xs lg:text-sm">
                            {formatCurrency(paidAmount + cardAmount)}
                          </span>
                        </div>
                        {paidAmount > 0 && paidAmount + cardAmount === total && (
                          <div className="text-center text-green-600 bg-green-100 py-1 px-2 rounded text-xs lg:text-xs">
                            ✓ المبلغ مضبوط تماماً
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-0.5 lg:gap-1">
                    {[50, 100, 200, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => addQuickAmount(amount)}
                        className="bg-blue-100 text-blue-700 py-0.5 lg:py-1 px-1 lg:px-2 rounded text-xs font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedPaymentMethod === 'mixed' && paidAmount + amount > total}
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>

                  {/* Change Display - Only for cash payment */}
                  {selectedPaymentMethod === 'cash' && (
                    <div className="bg-white p-2 lg:p-3 rounded-lg border border-gray-300">
                      <div className="text-center">
                        <p className="text-xs lg:text-xs text-gray-600 mb-1">الباقي</p>
                        <div className={`text-lg lg:text-2xl font-bold mb-1 ${
                          paidAmount === 0 ? 'text-gray-400' :
                          change > 0 ? 'text-green-600' : 
                          shortage > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {paidAmount === 0 ? '---' :
                           change > 0 ? formatCurrency(change) : 
                           shortage > 0 ? `-${formatCurrency(shortage)}` : 
                           '0.00 جنيه'}
                        </div>
                        
                        {/* Status Messages */}
                        {paidAmount > 0 && (
                          <div className="text-xs lg:text-xs">
                            {shortage > 0 && (
                              <p className="text-red-600 bg-red-50 py-0.5 lg:py-1 px-1 lg:px-2 rounded">
                                المبلغ المدفوع أقل من المطلوب
                              </p>
                            )}
                            {change > 0 && (
                              <p className="text-green-600 bg-green-50 py-0.5 lg:py-1 px-1 lg:px-2 rounded">
                                يرجى إعطاء الباقي للعميل
                              </p>
                            )}
                            {change === 0 && shortage === 0 && (
                              <p className="text-blue-600 bg-blue-50 py-0.5 lg:py-1 px-1 lg:px-2 rounded">
                                المبلغ مضبوط تماماً
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Complete Sale Button */}
                  <button
                    onClick={handleCompleteSale}
                    disabled={
                      (selectedPaymentMethod === 'cash' && paidAmount < total) ||
                      (selectedPaymentMethod === 'mixed' && paidAmount > total)
                    }
                    className="w-full bg-green-600 text-white py-2 lg:py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base"
                  >
                    <Receipt className="w-4 h-4" />
                    {selectedPaymentMethod === 'cash' && paidAmount < total ? 'أدخل المبلغ المطلوب' :
                     selectedPaymentMethod === 'mixed' && paidAmount > total ? 'المبلغ النقدي أكبر من المطلوب' :
                     'تأكيد البيع'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 lg:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">معاينة الفاتورة</h2>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3 text-sm lg:text-base">تفاصيل الأصناف</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-white p-2 lg:p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm lg:text-base">{item.product.name}</h4>
                          <p className="text-xs lg:text-sm text-gray-600">
                            {formatCurrency(item.product.price)} × {item.quantity} {getUnitText(item.product.unit)}
                          </p>
                          <p className="text-xs lg:text-xs text-gray-500 font-mono hidden lg:block">{item.product.barcode}</p>
                        </div>
                        <div className="text-left flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-700 p-0.5 lg:p-1 hover:bg-red-50 rounded transition-colors"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                          <p className="font-bold text-blue-600 text-sm lg:text-base">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 p-0.5 lg:p-1 rounded hover:bg-gray-300 transition-colors w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-2 h-2 lg:w-3 lg:h-3" />
                          </button>
                          <span className="font-medium px-1 lg:px-2 py-0.5 lg:py-1 bg-gray-100 rounded min-w-[2rem] lg:min-w-[2.5rem] text-center text-xs lg:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 p-0.5 lg:p-1 rounded hover:bg-gray-300 transition-colors w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center"
                            disabled={item.quantity >= item.product.quantity}
                          >
                            <Plus className="w-2 h-2 lg:w-3 lg:h-3" />
                          </button>
                        </div>
                        <div className="text-xs lg:text-xs text-gray-600">
                          متوفر: {item.product.quantity} {getUnitText(item.product.unit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-2 lg:p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد الأصناف:</span>
                    <span className="font-medium">{cart.length} صنف</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي القطع:</span>
                    <span className="font-medium">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                    </span>
                  </div>
                </div>
                <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-xs lg:text-sm">المجموع الفرعي:</span>
                    <span className="font-medium text-xs lg:text-sm">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-xs lg:text-sm">الضريبة (14%):</span>
                    <span className="font-medium text-xs lg:text-sm">{formatCurrency(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-xs lg:text-sm">الخصم:</span>
                      <span className="font-medium text-red-600 text-xs lg:text-sm">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm lg:text-lg font-bold border-t pt-2">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Show message if cart becomes empty */}
            {cart.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm lg:text-lg mb-4">تم حذف جميع الأصناف</p>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-blue-600 text-white py-2 px-4 lg:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm lg:text-base"
                >
                  العودة لإضافة أصناف
                </button>
              </div>
            )}

            {cart.length > 0 && (
              <div className="flex gap-2 lg:gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  العودة للتعديل
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    // Scroll to payment section and highlight it
                    setTimeout(() => {
                      const paymentSection = document.querySelector('.payment-section');
                      if (paymentSection) {
                        paymentSection.scrollIntoView({ behavior: 'smooth' });
                        // Add a temporary highlight effect
                        paymentSection.classList.add('highlight-payment');
                        setTimeout(() => {
                          paymentSection.classList.remove('highlight-payment');
                        }, 2000);
                      }
                    }, 100);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  متابعة للدفع
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <Receipt className="w-10 h-10 lg:w-12 lg:h-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">فاتورة البيع</h2>
              <p className="text-gray-600 text-sm lg:text-base">رقم الفاتورة: {lastSale.id}</p>
            </div>

            <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
              {lastSale.items.map((item: any) => (
                <div key={item.product.id} className="flex justify-between">
                  <div>
                    <span className="font-medium text-sm lg:text-base">{item.product.name}</span>
                    <span className="text-gray-600 text-xs lg:text-sm"> × {item.quantity}</span>
                  </div>
                  <span className="text-sm lg:text-base">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 lg:pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm lg:text-base">المجموع الفرعي:</span>
                <span className="text-sm lg:text-base">{formatCurrency(lastSale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm lg:text-base">الضريبة:</span>
                <span className="text-sm lg:text-base">{formatCurrency(lastSale.tax)}</span>
              </div>
              {lastSale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm lg:text-base">الخصم:</span>
                  <span className="text-sm lg:text-base">-{formatCurrency(lastSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base lg:text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span>{formatCurrency(lastSale.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm lg:text-base">طريقة الدفع:</span>
                <span className="text-sm lg:text-base">
                  {lastSale.paymentMethod === 'cash' ? 'نقدي' : 
                   lastSale.paymentMethod === 'visa' ? 'فيزا' : 'مختلط'}
                </span>
              </div>
              
              {/* Payment Details */}
              {lastSale.paymentMethod === 'mixed' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm lg:text-base">المبلغ النقدي:</span>
                    <span className="text-sm lg:text-base">{formatCurrency(lastSale.cashAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm lg:text-base">مبلغ الفيزا:</span>
                    <span className="text-sm lg:text-base">{formatCurrency(lastSale.cardAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm lg:text-base">إجمالي المدفوع:</span>
                    <span className="text-sm lg:text-base">{formatCurrency(lastSale.paidAmount)}</span>
                  </div>
                </>
              ) : lastSale.paymentMethod === 'cash' && lastSale.paidAmount ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm lg:text-base">المبلغ المدفوع:</span>
                    <span className="text-sm lg:text-base">{formatCurrency(lastSale.paidAmount)}</span>
                  </div>
                  {lastSale.change && lastSale.change > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span className="text-sm lg:text-base">الباقي:</span>
                      <span className="text-sm lg:text-base">{formatCurrency(lastSale.change)}</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-gray-600 text-white py-2 lg:py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <Printer className="w-4 h-4 lg:w-5 lg:h-5" />
                طباعة
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 bg-blue-600 text-white py-2 lg:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
