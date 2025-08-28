import React, { useState } from 'react';
import { Settings, Store, Receipt, Percent, User, Save, Bell, Palette, Globe } from 'lucide-react';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxNumber: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
}

interface SystemSettings {
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  printAutomatically: boolean;
  lowStockAlert: number;
  backupEnabled: boolean;
}

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<'store' | 'system' | 'receipt'>('store');
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'متجر البركة',
    storeAddress: 'شارع الجمهورية، القاهرة، مصر',
    storePhone: '01234567890',
    taxNumber: '123456789',
    taxRate: 14,
    currency: 'EGP',
    receiptFooter: 'شكراً لزيارتكم - نتمنى لكم يوماً سعيداً'
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'ar',
    theme: 'light',
    soundEnabled: true,
    printAutomatically: false,
    lowStockAlert: 10,
    backupEnabled: true
  });

  const handleStoreSettingsChange = (field: keyof StoreSettings, value: string | number) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemSettingsChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    // هنا يمكن حفظ الإعدادات في localStorage أو قاعدة البيانات
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const tabs = [
    { id: 'store', label: 'إعدادات المتجر', icon: Store },
    { id: 'system', label: 'إعدادات النظام', icon: Settings },
    { id: 'receipt', label: 'إعدادات الفاتورة', icon: Receipt }
  ];

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
          <p className="text-gray-600">إدارة إعدادات المتجر والنظام</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'store' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات المتجر</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => handleStoreSettingsChange('storeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={storeSettings.storePhone}
                    onChange={(e) => handleStoreSettingsChange('storePhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المتجر</label>
                  <textarea
                    value={storeSettings.storeAddress}
                    onChange={(e) => handleStoreSettingsChange('storeAddress', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={storeSettings.taxNumber}
                    onChange={(e) => handleStoreSettingsChange('taxNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">معدل الضريبة (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={storeSettings.taxRate}
                    onChange={(e) => handleStoreSettingsChange('taxRate', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات النظام</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) => handleSystemSettingsChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المظهر</label>
                  <select
                    value={systemSettings.theme}
                    onChange={(e) => handleSystemSettingsChange('theme', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تنبيه نفاد المخزون</label>
                  <input
                    type="number"
                    value={systemSettings.lowStockAlert}
                    onChange={(e) => handleSystemSettingsChange('lowStockAlert', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">عدد القطع التي يظهر عندها تنبيه نفاد المخزون</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">الخيارات المتقدمة</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">تفعيل الأصوات</p>
                        <p className="text-sm text-gray-600">تشغيل أصوات التنبيهات والإشعارات</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.soundEnabled}
                        onChange={(e) => handleSystemSettingsChange('soundEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">طباعة تلقائية</p>
                        <p className="text-sm text-gray-600">طباعة الفاتورة تلقائياً بعد إتمام البيع</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.printAutomatically}
                        onChange={(e) => handleSystemSettingsChange('printAutomatically', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات الفاتورة</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص أسفل الفاتورة</label>
                  <textarea
                    value={storeSettings.receiptFooter}
                    onChange={(e) => handleStoreSettingsChange('receiptFooter', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل النص الذي تريد ظهوره في أسفل الفاتورة"
                  />
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">معاينة الفاتورة</h3>
                  <div className="bg-white p-4 border border-gray-300 rounded-lg max-w-sm">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-bold">{storeSettings.storeName}</h4>
                      <p className="text-xs text-gray-600">فاتورة ضريبية</p>
                      <p className="text-xs text-gray-500">رقم الفاتورة: 12345</p>
                      <p className="text-xs text-gray-500">{new Date().toLocaleString('ar-EG')}</p>
                    </div>

                    <div className="border-t border-b border-gray-300 py-2 mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <div>
                          <p className="font-medium">منتج تجريبي</p>
                          <p className="text-gray-600">2 قطعة × 10.00 جنيه</p>
                        </div>
                        <p className="font-medium">20.00 جنيه</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>20.00 جنيه</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الضريبة ({storeSettings.taxRate}%):</span>
                        <span>{(20 * storeSettings.taxRate / 100).toFixed(2)} جنيه</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>الإجمالي:</span>
                        <span>{(20 + (20 * storeSettings.taxRate / 100)).toFixed(2)} جنيه</span>
                      </div>
                    </div>

                    <div className="text-center mt-4 text-xs text-gray-500">
                      <p>{storeSettings.receiptFooter}</p>
                      <p>الرقم الضريبي: {storeSettings.taxNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={handleSaveSettings}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ جميع الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}