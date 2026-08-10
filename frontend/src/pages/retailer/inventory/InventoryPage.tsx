import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

export const InventoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ lowStock: any[]; outOfStock: any[] }>({ lowStock: [], outOfStock: [] });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [quantityChange, setQuantityChange] = useState(1);
  const [reference, setReference] = useState('');

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [historyRes, alertsRes, productsRes] = await Promise.all([
        apiClient.get('/inventory/history'),
        apiClient.get('/inventory/alerts'),
        apiClient.get('/products?limit=1000'),
      ]);
      setHistory(historyRes.data.data);
      setAlerts(alertsRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/inventory/adjust', {
        product_id: selectedProductId,
        type: adjustType,
        quantity_change: Number(quantityChange),
        reference,
      });
      setSuccess('Stock adjusted successfully');
      setAdjustModalOpen(false);
      fetchInventoryData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Stock adjustment failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory & Stock Management</h1>
        <button
          onClick={() => setAdjustModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Stock Adjustment / In
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Out of Stock Alerts ({alerts.outOfStock.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.outOfStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="text-sm bg-red-200 text-red-800 px-2 py-1 rounded">SKU: {item.sku}</span>
              </div>
            ))}
            {alerts.outOfStock.length === 0 && <p className="text-gray-500 text-sm">No out-of-stock items.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-amber-600 mb-4">Low Stock Alerts ({alerts.lowStock.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <div className="text-xs text-gray-500">Qty: {item.quantity} (Min: {item.min_stock})</div>
                </div>
                <span className="text-sm bg-amber-200 text-amber-800 px-2 py-1 rounded">SKU: {item.sku}</span>
              </div>
            ))}
            {alerts.lowStock.length === 0 && <p className="text-gray-500 text-sm">No low stock items.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Movement Audit History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="p-3">Date</th>
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">Change</th>
                <th className="p-3">New Qty</th>
                <th className="p-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-gray-700">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3 font-medium">{log.product_name}</td>
                  <td className="p-3 uppercase text-xs font-semibold">
                    <span className={`px-2 py-1 rounded ${log.type === 'stock_in' ? 'bg-green-100 text-green-800' : log.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className={`p-3 font-bold ${log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                  </td>
                  <td className="p-3 font-medium">{log.new_quantity}</td>
                  <td className="p-3 text-gray-500">{log.reference || '-'}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">No inventory history logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Stock Adjustment / In</h3>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  className="w-full mt-1 border rounded-lg p-2"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="w-full mt-1 border rounded-lg p-2"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                >
                  <option value="stock_in">Stock In</option>
                  <option value="stock_out">Stock Out</option>
                  <option value="adjustment">Adjustment / Set Qty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg p-2"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference / Notes</label>
                <input
                  type="text"
                  className="w-full mt-1 border rounded-lg p-2"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. Supplier delivery, stock count"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};