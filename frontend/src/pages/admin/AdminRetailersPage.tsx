import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

export const AdminRetailersPage: React.FC = () => {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRetailers();
  }, [search]);

  const fetchRetailers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await apiClient.get(`/api/admin/retailers?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRetailers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('admin_token');
      await apiClient.put(`/api/admin/retailers/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRetailers();
    } catch (err: any) {
      alert('Failed to update retailer status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Retailer Tenant Management</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by business name or email..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {retailers.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.business_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.owner_name} <br/> {r.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.subscription_name || 'Free'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.product_count}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleStatus(r.id, r.status)}
                    className={`px-3 py-1 rounded text-white ${r.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {r.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};