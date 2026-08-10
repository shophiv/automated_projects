import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/analytics/sales');
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics data...</div>;
  if (!analytics) return <div className="p-6">Failed to load analytics.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Sales Analytics & Intelligence</h1>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Trend</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-3">Period</th>
                <th className="p-3">Transactions</th>
                <th className="p-3">Revenue</th>
                <th className="p-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sales_trend?.map((row: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3">{row.period}</td>
                  <td className="p-3">{row.transaction_count}</td>
                  <td className="p-3 font-semibold text-indigo-600">${parseFloat(row.revenue).toFixed(2)}</td>
                  <td className="p-3 font-semibold text-green-600">${parseFloat(row.profit).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Payment Method Distribution</h2>
          <div className="space-y-2">
            {analytics.payment_distribution?.map((pay: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="capitalize font-medium">{pay.payment_method}</span>
                <span>{pay.count} txns (${parseFloat(pay.total).toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Category Performance</h2>
          <div className="space-y-2">
            {analytics.category_performance?.map((cat: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{cat.category_name || 'Uncategorized'}</span>
                <span className="font-semibold text-indigo-600">${parseFloat(cat.total_sales || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};