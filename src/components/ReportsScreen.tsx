import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ReportsScreen() {
  const { getDailyReport, getWeeklyReport, getMonthlyReport, getTopProducts } = useApp();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} جنيه`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getDayName = (dateString: string) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[new Date(dateString).getDay()];
  };

  const getReportData = () => {
    switch (reportType) {
      case 'daily':
        return [getDailyReport(selectedDate)];
      case 'weekly':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return getWeeklyReport(weekStart.toISOString().split('T')[0]);
      case 'monthly':
        return getMonthlyReport(selectedYear, selectedMonth);
      default:
        return [getDailyReport(selectedDate)];
    }
  };

  const reportData = getReportData();
  const totalData = reportData.reduce((acc, report) => ({
    totalSales: acc.totalSales + report.totalSales,
    totalReturns: acc.totalReturns + report.totalReturns,
    netSales: acc.netSales + report.netSales,
    totalProfit: acc.totalProfit + report.totalProfit,
    transactionCount: acc.transactionCount + report.transactionCount
  }), { totalSales: 0, totalReturns: 0, netSales: 0, totalProfit: 0, transactionCount: 0 });

  const topProducts = getTopProducts(30);

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">التقارير والإحصائيات</h1>
            <p className="text-gray-600">تحليل المبيعات والأرباح</p>
          </div>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          تصدير التقرير
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">فلترة التقارير</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>

          {reportType !== 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('ar-EG', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={2024 - i} value={2024 - i}>
                      {2024 - i}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalData.totalSales)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">المرتجعات</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalData.totalReturns)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-red-500 transform rotate-180" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">صافي المبيعات</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalData.netSales)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">الأرباح</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalData.totalProfit)}</p>
            </div>
            <ShoppingBag className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detailed Report */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-800">
              التقرير {reportType === 'daily' ? 'اليومي' : reportType === 'weekly' ? 'الأسبوعي' : 'الشهري'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المبيعات</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المرتجعات</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الأرباح</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((report, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{formatDate(report.date)}</div>
                        {reportType === 'weekly' && (
                          <div className="text-sm text-gray-600">{getDayName(report.date)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      {formatCurrency(report.totalSales)}
                    </td>
                    <td className="py-3 px-4 text-red-600 font-semibold">
                      {formatCurrency(report.totalReturns)}
                    </td>
                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {formatCurrency(report.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold text-gray-800">المنتجات الأكثر مبيعاً</h3>
            <span className="text-sm text-gray-600">(آخر 30 يوم)</span>
          </div>

          <div className="space-y-4">
            {topProducts.slice(0, 10).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{product.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {product.quantitySold} قطعة مباعة
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد مبيعات في هذه الفترة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}