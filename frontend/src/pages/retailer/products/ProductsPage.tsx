import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  selling_price: number;
  purchase_price: number;
  quantity: number;
  unit: string;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('0');

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/products?search=${encodeURIComponent(query)}`);
      setProducts(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchProducts(val);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/products', {
        name,
        sku,
        barcode: barcode || null,
        purchase_price: parseFloat(purchasePrice),
        selling_price: parseFloat(sellingPrice),
        quantity: parseInt(quantity, 10) || 0,
      });
      setShowModal(false);
      setName('');
      setSku('');
      setBarcode('');
      setPurchasePrice('');
      setSellingPrice('');
      setQuantity('0');
      fetchProducts(search);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create product');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiClient.post(`/products/${id}/duplicate`);
      fetchProducts(search);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to duplicate product');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts(search);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to archive product');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
        >
          Add Product
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by name, SKU, or barcode (<300ms search)..."
          value={search}
          onChange={handleSearchChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.barcode || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(p.purchase_price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(p.selling_price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.quantity} {p.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleDuplicate(p.id)} className="text-indigo-600 hover:text-indigo-900">Duplicate</button>
                  <button onClick={() => handleArchive(p.id)} className="text-red-600 hover:text-red-900">Archive</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};