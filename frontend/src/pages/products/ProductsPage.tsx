import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/product.api';
import { Product, Category } from '../../types/product.types';
import { BarcodeScannerModal } from '../../components/barcode/BarcodeScannerModal';
import { Package, Search, Plus, Scan, Tag, Trash2, Edit, LogOut, ShieldAlert } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedProductModal, setScannedProductModal] = useState<Product | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '' as string | number,
    purchasePrice: '',
    sellingPrice: ''
  });

  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        productApi.getProducts(search, selectedCategory),
        productApi.getCategories()
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory]);

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', barcode: '', categoryId: '', purchasePrice: '', sellingPrice: '' });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.category_id || '',
      purchasePrice: product.purchase_price.toString(),
      sellingPrice: product.selling_price.toString()
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode ? formData.barcode : null,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice)
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, payload);
      } else {
        await productApi.createProduct(payload);
      }

      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete product.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.createCategory({ name: categoryName });
      setCategoryName('');
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create category.');
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await productApi.getProductByBarcode(barcode);
      setScannedProductModal(product);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'No product found with scanned barcode.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">Smart Retail POS</h1>
            <p className="text-xs text-slate-400">Tenant #{user?.tenant_id} | Role: <span className="uppercase text-indigo-400 font-semibold">{user?.role}</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition border border-slate-600 shadow-sm"
          >
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 px-3 py-2 rounded-lg text-sm font-medium transition border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Product Catalog</h2>
            <p className="text-slate-400 text-sm">Manage inventory items, categories, pricing, and barcodes.</p>
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition shadow-sm"
              >
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Add Category</span>
              </button>
              <button
                onClick={handleOpenCreateProduct}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU, barcode..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <span className="text-xs font-medium text-slate-400 uppercase">Category:</span>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-slate-900 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Product Name</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Barcode</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Purchase Price</th>
                  <th className="py-3.5 px-6">Selling Price</th>
                  {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-400">Loading catalog...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-400">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6 font-medium text-white">{product.name}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">{product.sku}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">{product.barcode || '—'}</td>
                      <td className="py-4 px-6 text-slate-300">{product.category_name || 'Uncategorized'}</td>
                      <td className="py-4 px-6 text-slate-300">${Number(product.purchase_price).toFixed(2)}</td>
                      <td className="py-4 px-6 text-emerald-400 font-semibold">${Number(product.selling_price).toFixed(2)}</td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-indigo-400 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 bg-slate-700 hover:bg-rose-600/20 text-rose-400 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      {/* Scanned Product Result Modal */}
      {scannedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-lg text-white flex items-center space-x-2">
              <Scan className="w-5 h-5 text-indigo-400" />
              <span>Scanned Product Result</span>
            </h3>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2">
              <p className="text-white font-bold text-lg">{scannedProductModal.name}</p>
              <p className="text-xs text-slate-400 font-mono">SKU: {scannedProductModal.sku} | Barcode: {scannedProductModal.barcode}</p>
              <p className="text-xs text-slate-400">Category: {scannedProductModal.category_name || 'Uncategorized'}</p>
              <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                <span className="text-slate-400 text-sm">Selling Price:</span>
                <span className="text-emerald-400 font-bold text-lg">${Number(scannedProductModal.selling_price).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setScannedProductModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-lg text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Organic Coffee Beans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="COFFEE-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="8901234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="10.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="19.99"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-lg text-white mb-4">Add Product Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Beverages"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};