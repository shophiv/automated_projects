import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardSummary } from '../../services/dashboardService';
import { TrendingUp, ShoppingBag, DollarSign, Package, AlertTriangle, ShieldAlert, ArrowUpRight, Clock, Award } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Retailer! 🚀</h1>
          <p className="text-indigo-200 mt-1">Here is a real-time overview of your store performance and inventory health today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = '/pos'} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl shadow-lg transition flex items-center gap-2">
            <ShoppingBag size={18} /> Open POS Terminal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Sales</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${summary?.todaySales.toFixed(2)}</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp size={14} /> +12.5% vs yesterday
            </span>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Estimated Profit</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${summary?.todayProfit.toFixed(2)}</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp size={14} /> +8.2% margin healthy
            </span>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ArrowUpRight size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Orders Processed</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.todayOrders}</h3>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2">
              <Clock size={14} /> Live transactions
            </span>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Inventory Status</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalProducts} Items</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-md">
                {summary?.lowStockCount} Low
              </span>
              <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 font-semibold rounded-md">
                {summary?.outOfStockCount} Out
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Package size={28} />
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" /> Recent Sales Transactions
            </h2>
            <button onClick={() => window.location.href = '/pos'} className="text-sm text-indigo-600 font-semibold hover:underline">
              View All POS
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {summary?.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 font-semibold text-slate-800">{sale.invoice_number}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-emerald-600">${Number(sale.total_amount).toFixed(2)}</td>
                    <td className="py-3.5 text-gray-400 text-xs">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" /> Top Sellers
            </h2>
          </div>
          <div className="space-y-4">
            {summary?.topProducts.map((prod, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{prod.name}</h4>
                    <p className="text-xs text-gray-500">{prod.quantity_sold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">${prod.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Banner */}
          {(summary?.lowStockCount ?? 0) > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-amber-800">Inventory Alert</h4>
                <p className="text-xs text-amber-700 mt-0.5">You have {summary?.lowStockCount} products running low on stock. Review inventory soon.</p>
                <button onClick={() => window.location.href = '/inventory'} className="mt-2 text-xs font-bold text-amber-900 underline hover:text-amber-950">
                  Manage Inventory &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};