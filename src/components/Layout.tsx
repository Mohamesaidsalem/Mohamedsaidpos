import React, { useState } from 'react';
import { LogOut, ShoppingCart, Package, User, Menu, X, BarChart3, AlertTriangle, RotateCcw, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'pos' | 'products' | 'reports' | 'returns' | 'inventory';
  onPageChange: (page: 'pos' | 'products' | 'reports' | 'returns' | 'inventory') => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { currentUser, logout, alerts } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  const menuItems = [
  { id: 'pos' as const, label: 'شاشة البيع', icon: ShoppingCart },
  { id: 'returns' as const, label: 'المرتجعات', icon: RotateCcw },
  ...(currentUser?.role === 'admin' ? [
    { id: 'products' as const, label: 'إدارة المنتجات', icon: Package },
    { id: 'inventory' as const, label: 'إدارة المخزون', icon: AlertTriangle },
    { id: 'reports' as const, label: 'التقارير', icon: BarChart3 }
  ] : [])
];

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {sidebarOpen && (
              <div className="mr-3">
                <h1 className="text-xl font-bold text-gray-800">متجر البركة</h1>
                <p className="text-sm text-gray-600">نظام POS متقدم</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts Notification */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-red-500" />
                {sidebarOpen && (
                  <span className="mr-2 text-sm text-red-600 font-medium">
                    {unacknowledgedAlerts.length} تنبيه جديد
                  </span>
                )}
              </div>
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unacknowledgedAlerts.length}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {sidebarOpen && <span className="mr-3 font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? 'mb-3' : 'mb-2'}`}>
            <div className="bg-blue-100 rounded-full p-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            {sidebarOpen && (
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-600">{currentUser?.role === 'admin' ? 'مدير' : 'كاشير'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="mr-3">تسجيل خروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}