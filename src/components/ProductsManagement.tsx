import React, { useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Package, Save, X, Upload, Image, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface ProductFormData {
  name: string;
  barcode: string;
  price: number;
  cost: number;
  quantity: number;
  unit: 'piece' | 'kg';
  minQuantity: number;
  expiryDate?: string;
  category: string;
  image?: string;
}

export function ProductsManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    barcode: '',
    price: 0,
    cost: 0,
    quantity: 0,
    unit: 'piece',
    minQuantity: 5,
    expiryDate: '',
    category: '',
    image: ''
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({ 
      name: '', 
      barcode: '', 
      price: 0, 
      cost: 0, 
      quantity: 0, 
      unit: 'piece', 
      minQuantity: 5, 
      expiryDate: '', 
      category: '',
      image: ''
    });
    setImagePreview('');
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    
    resetForm();
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      unit: product.unit,
      minQuantity: product.minQuantity,
      expiryDate: product.expiryDate || '',
      category: product.category,
      image: product.image || ''
    });
    setImagePreview(product.image || '');
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };

  const getUnitText = (unit: string) => {
    return unit === 'kg' ? 'كيلو' : 'قطعة';
  };

  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = timestamp.slice(-10) + random;
    setFormData({ ...formData, barcode });
  };

  const calculateProfitMargin = () => {
    if (formData.cost > 0 && formData.price > 0) {
      return (((formData.price - formData.cost) / formData.cost) * 100).toFixed(1);
    }
    return '0';
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h1>
            <p className="text-gray-600">إدارة وتحديث المنتجات في المتجر</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث عن منتج (الاسم أو الباركود)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.quantity > product.minQuantity 
                      ? 'bg-green-500 text-white' 
                      : product.quantity > 0 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {product.quantity > product.minQuantity ? 'متوفر' : product.quantity > 0 ? 'قليل' : 'نفد'}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{product.barcode}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">السعر:</span>
                    <span className="font-bold text-blue-600">{product.price.toFixed(2)} جنيه</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">التكلفة:</span>
                    <span className="font-medium text-gray-700">{product.cost.toFixed(2)} جنيه</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الكمية:</span>
                    <span className="font-medium">{product.quantity} {getUnitText(product.unit)}</span>
                  </div>
                  {product.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الانتهاء:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(product.expiryDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد منتجات</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Image Section */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                    <Image className="w-5 h-5" />
                    صورة المنتج
                  </h3>
                  
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="معاينة المنتج"
                        className="w-32 h-32 object-cover rounded-xl border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <div className="mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? 'تغيير الصورة' : 'رفع صورة'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG أو GIF (الحد الأقصى 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل اسم المنتج"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الباركود *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="أدخل الباركود"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateBarcode}
                        className="bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
                        title="توليد باركود تلقائي"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثل: مواد غذائية، مشروبات، إلخ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">وحدة القياس *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'piece' | 'kg' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="piece">قطعة</option>
                      <option value="kg">كيلو</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">سعر البيع (جنيه) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">سعر التكلفة (جنيه) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                      min="0"
                    />
                    {formData.cost > 0 && formData.price > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        هامش الربح: {calculateProfitMargin()}%
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الكمية الحالية *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى للمخزون *</label>
                    <input
                      type="number"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ انتهاء الصلاحية (اختياري)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Summary Card */}
              {(formData.name || formData.price > 0) && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">ملخص المنتج</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">الاسم:</span>
                      <p className="font-medium text-gray-800">{formData.name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">الفئة:</span>
                      <p className="font-medium text-gray-800">{formData.category || 'غير محدد'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">السعر:</span>
                      <p className="font-medium text-blue-600">{formData.price.toFixed(2)} جنيه</p>
                    </div>
                    <div>
                      <span className="text-gray-600">الكمية:</span>
                      <p className="font-medium text-gray-800">{formData.quantity} {getUnitText(formData.unit)}</p>
                    </div>
                    {formData.cost > 0 && formData.price > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-600">هامش الربح:</span>
                        <p className="font-medium text-green-600">{calculateProfitMargin()}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}