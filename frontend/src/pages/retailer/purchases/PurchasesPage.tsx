import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

interface PurchaseOrder {
  id: string;
  supplier_name: string;
  status: string;
  total_cost: number;
  expected_delivery_date: string;
  items: Array<{ product_id: string; quantity: number; unit_cost: number }>;
}

export const PurchasesPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poItems, setPoItems] = useState<Array<{ product_id: string; quantity: number; unit_cost: number }>>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const fetchData = async () => {
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        apiClient.get('/purchase-orders'),
        apiClient.get('/suppliers'),
        apiClient.get('/products'),
      ]);
      setPurchaseOrders(poRes.data.data);
      setSuppliers(supRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    setPoItems([...poItems, { product_id: selectedProductId, quantity, unit_cost: unitCost || prod?.purchase_price || 0 }]);
    setSelectedProductId('');
    setQuantity(1);
    setUnitCost(0);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || poItems.length === 0) {
      alert('Select a supplier and add at least one item');
      return;
    }
    try {
      await apiClient.post('/purchase-orders', {
        supplier_id: supplierId,
        expected_delivery_date: expectedDate || null,
        items: poItems,
      });
      setShowModal(false);
      setSupplierId('');
      setExpectedDate('');
      setPoItems([]);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create purchase order');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/purchase-orders/${id}/status`, { status });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Orders & Restocking</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Create Purchase Order
        </button>
      </div>

      {loading ? (
        <div>Loading purchase orders...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{po.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{po.supplier_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      po.status === 'completed' || po.status === 'received' ? 'bg-green-100 text-green-800' :
                      po.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">${Number(po.total_cost).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{po.expected_delivery_date || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {po.status === 'draft' && (
                      <button onClick={() => updateStatus(po.id, 'submitted')} className="text-indigo-600 hover:text-indigo-900">
                        Submit
                      </button>
                    )}
                    {po.status === 'submitted' && (
                      <button onClick={() => updateStatus(po.id, 'approved')} className="text-blue-600 hover:text-blue-900">
                        Approve
                      </button>
                    )}
                    {(po.status === 'submitted' || po.status === 'approved') && (
                      <button onClick={() => updateStatus(po.id, 'received')} className="text-green-600 hover:text-green-900 font-bold">
                        Receive Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.business_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Cost"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-gray-900 text-sm"
                  >
                    Add
                  </button>
                </div>

                <ul className="divide-y divide-gray-200 border rounded-md p-2 max-h-40 overflow-y-auto">
                  {poItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.product_id);
                    return (
                      <li key={idx} className="py-1 flex justify-between text-sm">
                        <span>{prod?.name} x {item.quantity}</span>
                        <span>${(item.quantity * item.unit_cost).toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
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
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};