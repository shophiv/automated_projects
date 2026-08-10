import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

interface Sale {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
  sale_date: string;
  cashier_name?: string;
}

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    fetchSales();
  }, [search, statusFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/sales?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      setSales(res.data.data);
    } catch (err) {
      console.error('Failed to fetch sales history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await apiClient.get(`/sales/${id}`);
      setSelectedSale(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to load sale details');
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Are you sure you want to refund this transaction and restore stock?')) return;
    try {
      await apiClient.post(`/sales/${id}/refund`);
      alert('Refund processed successfully');
      setSelectedSale(null);
      fetchSales();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Refund failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Sales History & Invoices</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by invoice or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <th className="p-3">Invoice</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Loading sales...</td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">No sales transactions found</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3 font-semibold text-blue-600">{sale.invoice_number}</td>
                  <td className="p-3">{sale.customer_name}</td>
                  <td className="p-3 font-bold">${Number(sale.total_amount).toFixed(2)}</td>
                  <td className="p-3 capitalize">{sale.payment_method.replace('_', ' ')}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(sale.sale_date).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleViewDetails(sale.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-2">Invoice Details: {selectedSale.invoice_number}</h2>
            <p className="text-sm text-gray-600">Customer: {selectedSale.customer_name}</p>
            <p className="text-sm text-gray-600">Date: {new Date(selectedSale.sale_date).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Status: <span className="uppercase font-semibold">{selectedSale.status}</span></p>

            <div className="my-4 max-h-60 overflow-y-auto border-t border-b py-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{item.product_name}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-2">${Number(item.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total Amount:</span>
              <span>${Number(selectedSale.total_amount).toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-2">
              {selectedSale.status === 'completed' && (
                <button
                  onClick={() => handleRefund(selectedSale.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Process Refund
                </button>
              )}
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};