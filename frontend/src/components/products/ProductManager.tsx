import React, { useState, useEffect } from 'react';
import { productService, Product, CreateProductDTO } from '../../services/productService';

interface ProductManagerProps {
  token: string;
}

export function ProductManager({ token }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [barcode, setBarcode] = useState('');
  const [initialQuantity, setInitialQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  // Inventory adjustment modal
  const [inventoryModalProduct, setInventoryModalProduct] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState('');
  const [newThreshold, setNewThreshold] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(token);
      setProducts(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  const openCreateModal = () => {
    setEditingId(null);
    setSku('');
    setName('');
    setDescription('');
    setPrice('');
    setCost('');
    setBarcode('');
    setInitialQuantity('0');
    setLowStockThreshold('5');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setSku(p.sku);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setBarcode(p.barcode || '');
    setInitialQuantity(p.quantity.toString());
    setLowStockThreshold(p.low_stock_threshold.toString());
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!sku.trim() || !name.trim() || price === '' || cost === '') {
      setError('SKU, Name, Price and Cost are required.');
      return;
    }

    try {
      if (editingId) {
        await productService.updateProduct(token, editingId, {
          sku,
          name,
          description,
          price: parseFloat(price),
          cost: parseFloat(cost),
          barcode,
        });
        await productService.updateInventory(token, editingId, parseInt(initialQuantity, 10), parseInt(lowStockThreshold, 10));
        setSuccessMsg('Product updated successfully.');
      } else {
        await productService.createProduct(token, {
          sku,
          name,
          description,
          price: parseFloat(price),
          cost: parseFloat(cost),
          barcode,
          initialQuantity: parseInt(initialQuantity, 10) || 0,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        });
        setSuccessMsg('Product created successfully.');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(token, id);
      setSuccessMsg('Product deleted.');
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await productService.duplicateProduct(token, id);
      setSuccessMsg('Product duplicated.');
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await productService.archiveProduct(token, id);
      setSuccessMsg('Product status updated.');
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openInventoryModal = (p: Product) => {
    setInventoryModalProduct(p);
    setNewQty(p.quantity.toString());
    setNewThreshold(p.low_stock_threshold.toString());
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryModalProduct) return;
    try {
      await productService.updateInventory(
        token,
        inventoryModalProduct.id,
        parseInt(newQty, 10) || 0,
        parseInt(newThreshold, 10) || 5
      );
      setInventoryModalProduct(null);
      setSuccessMsg('Inventory updated successfully.');
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Product &amp; Inventory Management</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
        >
          + Add New Product
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">{successMsg}</div>}

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading catalog...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU / Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No products found in workspace.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className={p.status === 'archived' ? 'bg-gray-50 text-gray-400' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-semibold text-gray-900">{p.sku}</div>
                      <div className="text-xs text-gray-500">{p.barcode || 'No barcode'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>${Number(p.price).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Cost: ${Number(p.cost).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.quantity <= p.low_stock_threshold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {p.quantity} units (Min: {p.low_stock_threshold})
                      </span>
                      <button
                        onClick={() => openInventoryModal(p)}
                        className="ml-2 text-xs text-blue-600 hover:underline"
                      >
                        Adjust
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openEditModal(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => handleDuplicate(p.id)} className="text-green-600 hover:text-green-900">Duplicate</button>
                      <button onClick={() => handleArchive(p.id)} className="text-yellow-600 hover:text-yellow-900">{p.status === 'active' ? 'Archive' : 'Activate'}</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Product' : 'Create New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU *</label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Barcode</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="0123456789"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Organic Coffee 12oz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Freshly roasted whole bean coffee..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="14.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="8.50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Adjustment Modal */}
      {inventoryModalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-2">Adjust Inventory</h3>
            <p className="text-sm text-gray-600 mb-4">{inventoryModalProduct.name} ({inventoryModalProduct.sku})</p>
            <form onSubmit={handleSaveInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input
                  type="number"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInventoryModalProduct(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}