import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard metrics...</div>;
  if (!data) return <div className="p-6">Failed to load dashboard.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Business Overview Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Today's Sales</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">${data.today.sales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Today's Profit</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${data.today.profit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Today's Orders</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.today.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Inventory Valuation</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">${data.inventory_value.toFixed(2)}</p>
        </div>
      </div>

      {/* Predictions & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Prediction & Forecast</h2>
          <p className="text-gray-600">Predicted Tomorrow's Sales: <span className="font-bold text-indigo-600">${data.predictions?.predicted_tomorrow_sales || 0}</span></p>
          <p className="text-gray-600 mt-2">Predicted Weekly Sales: <span className="font-bold text-indigo-600">${data.predictions?.predicted_weekly_sales || 0}</span></p>
          
          <h3 className="text-md font-semibold mt-6 mb-2 text-gray-700">Reorder Suggestions</h3>
          {data.predictions?.reorder_suggestions?.length === 0 ? (
            <p className="text-sm text-gray-500">All stock levels are optimal.</p>
          ) : (
            <ul className="space-y-2">
              {data.predictions?.reorder_suggestions?.map((item: any) => (
                <li key={item.product_id} className="text-sm bg-yellow-50 p-2 rounded flex justify-between">
                  <span>{item.name} ({item.sku})</span>
                  <span className="font-medium text-yellow-800">Order Qty: {item.suggested_order_qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Top Selling Products</h2>
          <div className="space-y-3">
            {data.top_selling_products?.map((prod: any) => (
              <div key={prod.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-gray-800">{prod.name}</p>
                  <p className="text-xs text-gray-500">SKU: {prod.sku}</p>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {prod.units_sold} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};