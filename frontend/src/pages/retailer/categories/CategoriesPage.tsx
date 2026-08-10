import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/categories', { name, description });
      setSuccess('Category created successfully');
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to archive category');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 font-medium"
            >
              Create Category
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Categories List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{cat.status}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};