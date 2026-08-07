import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Category } from '../../types/product';
import { Plus, Edit, Trash2, Archive, FolderTree } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories?includeArchived=true');
      setCategories(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name, description });
        setSuccessMessage('Category updated successfully');
      } else {
        await api.post('/categories', { name, description });
        setSuccessMessage('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this category?')) return;
    try {
      await api.patch(`/categories/${id}/archive`);
      setSuccessMessage('Category archived');
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccessMessage('Category deleted');
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="h-7 w-7 text-indigo-600" /> Category Management
          </h1>
          <p className="text-sm text-gray-500">Organize your store inventory into logical classification groups.</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow"
          >
            <Plus className="h-5 w-5" /> Add Category
          </button>
        )}
      </div>

      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>}
      {successMessage && <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">{successMessage}</div>}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No categories found. Create your first category!</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className={cat.is_archived ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${cat.is_archived ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                      {cat.is_archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canManage && (
                      <>
                        <button onClick={() => handleOpenModal(cat)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        {!cat.is_archived && (
                          <button onClick={() => handleArchive(cat.id)} className="text-yellow-600 hover:text-yellow-900" title="Archive">
                            <Archive className="h-5 w-5 inline" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900" title="Delete">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};