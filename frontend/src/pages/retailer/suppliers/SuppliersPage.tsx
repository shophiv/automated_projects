import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

interface Supplier {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  outstanding_balance: number;
}

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const fetchSuppliers = async () => {
    try {
      const res = await apiClient.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/suppliers', formData);
      setShowModal(false);
      setFormData({ business_name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
      fetchSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create supplier');
    }
  };

  const viewReport = async (id: string) => {
    try {
      const res = await apiClient.get(`/suppliers/${id}/reports`);
      setSelectedReport(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Add Supplier
        </button>
      </div>

      {loading ? (
        <div>Loading suppliers...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone / Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.business_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{s.contact_person || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div>{s.phone}</div>
                    <div className="text-xs text-gray-400">{s.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">${Number(s.outstanding_balance).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => viewReport(s.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Supplier</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Supplier Report: {selectedReport.supplier.business_name}</h2>
            <div className="mb-4 text-sm text-gray-600">
              <p>Contact: {selectedReport.supplier.contact_person || 'N/A'} ({selectedReport.supplier.phone})</p>
              <p>Outstanding Balance: ${Number(selectedReport.metrics.outstanding_balance).toFixed(2)}</p>
              <p>Total Purchase Orders: {selectedReport.metrics.total_purchase_orders}</p>
            </div>
            <h3 className="font-semibold text-lg mb-2">Products Supplied</h3>
            <ul className="mb-4 divide-y divide-gray-200">
              {selectedReport.products_supplied.map((p: any) => (
                <li key={p.id} className="py-2 flex justify-between text-sm">
                  <span>{p.name} (SKU: {p.sku})</span>
                  <span className="font-medium">Total Purchased: {p.total_purchased}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
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