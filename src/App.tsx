import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { POSScreen } from './components/POSScreen';
import { ProductsManagement } from './components/ProductsManagement';
import { ReportsScreen } from './components/ReportsScreen';
import { ReturnsScreen } from './components/ReturnsScreen';
import { InventoryManagement } from './components/InventoryManagement';
import { Layout } from './components/Layout';

type Screen = 'pos' | 'products' | 'reports' | 'returns' | 'inventory';

function AppContent() {
  const { currentUser } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>('pos');

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'pos':
        return <POSScreen />;
      case 'products':
        return currentUser.role === 'admin' ? <ProductsManagement /> : (
          <div className="p-6 text-center" dir="rtl">
            <h2 className="text-2xl font-bold text-red-600 mb-2">لا يوجد صلاحية</h2>
            <p className="text-gray-600">ليس لديك إذن للوصول إلى هذه الصفحة.</p>
          </div>
        );
      case 'reports':
        return currentUser.role === 'admin' ? <ReportsScreen /> : (
          <div className="p-6 text-center" dir="rtl">
            <h2 className="text-2xl font-bold text-red-600 mb-2">لا يوجد صلاحية</h2>
            <p className="text-gray-600">ليس لديك إذن للوصول إلى هذه الصفحة.</p>
          </div>
        );
      case 'returns':
        return <ReturnsScreen />;
      case 'inventory':
        return currentUser.role === 'admin' ? <InventoryManagement /> : (
          <div className="p-6 text-center" dir="rtl">
            <h2 className="text-2xl font-bold text-red-600 mb-2">لا يوجد صلاحية</h2>
            <p className="text-gray-600">ليس لديك إذن للوصول إلى هذه الصفحة.</p>
          </div>
        );
      default:
        return <POSScreen />;
    }
  };

  return (
    <Layout currentPage={currentScreen} onPageChange={setCurrentScreen}>
      {renderScreen()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;