import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Product, Category } from '../../types/product';
import { Plus, Edit, Trash2, Archive, Copy, Package, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    sku: '',
    barcode: '',
    brand: '',
    purchase_price: 0,
    selling_price: 0,
    wholesale_price: 0,
    discount_price: 0,
    tax_rate: 0,
    unit: 'pcs',
    quantity: 0,
    min_stock: 5,
    max_stock: 100,
    description: '',
  });

  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?search=${search}&category_id=${selectedCategory}&is_archived=false`),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory]);

  const handleOpenModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        category_id: prod.category_id,
        sku: prod.sku,
        barcode: prod.barcode,
        brand: prod.brand || '',
        purchase_price: prod.purchase_price,
        selling_price: prod.selling_price,
        wholesale_price: prod.wholesale_price || 0,
        discount_price: prod.discount_price || 0,
        tax_rate: prod.tax_rate || 0,
        unit: prod.unit || 'pcs',
        quantity: prod.quantity,
        min_stock: prod.min_stock,
        max_stock: prod.max_stock,
        description: prod.description || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        brand: '',
        purchase_price: 0,
        selling_price: 0,
        wholesale_price: 0,
        discount_price: 0,
        tax_rate: 0,
        unit: 'pcs',
        quantity: 0,
        min_stock: 5,
        max_stock: 100,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        purchase_price: Number(formData.purchase_price),
        selling_price: Number(formData.selling_price),
        wholesale_price: Number(formData.wholesale_price),
        discount_price: Number(formData.discount_price),
        tax_rate: Number(formData.tax_rate),
        quantity: Number(formData.quantity),
        min_stock: Number(formData.min_stock),
        max_stock: Number(formData.max_stock),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        setSuccessMessage('Product updated successfully');
      } else {
        await api.post('/products', payload);
        setSuccessMessage('Product created successfully');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this product?')) return;
    try {
      await api.patch(`/products/${id}/archive`);
      setSuccessMessage('Product archived');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive product');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      setSuccessMessage('Product duplicated successfully');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to duplicate product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccessMessage('Product deleted');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-indigo-600" /> Product Management
          </h1>
          <p className="text-sm text-gray-500">Manage your catalog items, SKUs, barcodes, and pricing.</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow"
          >
            <Plus className="h-5 w-5" /> Add Product
          </button>
        )}
      </div>

      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>}
      {successMessage && <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">{successMessage}</div>}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU / Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost / Price</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    {p.brand && <div className="text-xs text-gray-500">{p.brand}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>SKU: {p.sku}</div>
                    <div className="text-xs font-mono">{p.barcode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="text-gray-900 font-semibold">${p.selling_price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost: ${p.purchase_price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${p.quantity <= p.min_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {p.quantity} {p.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canManage && (
                      <>
                        <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        <button onClick={() => handleDuplicate(p.id)} className="text-blue-600 hover:text-blue-900" title="Duplicate">
                          <Copy className="h-5 w-5 inline" />
                        </button>
                        <button onClick={() => handleArchive(p.id)} className="text-yellow-600 hover:text-yellow-900" title="Archive">
                          <Archive className="h-5 w-5 inline" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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