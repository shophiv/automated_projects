import React, { useState } from 'react';
import API from '../services/api';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export default function ExpenseItem({ expense, categories, onExpenseUpdated, onExpenseDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(expense.amount);
  const [categoryId, setCategoryId] = useState(expense.category?._id || '');
  const [description, setDescription] = useState(expense.description || '');
  const [date, setDate] = useState(expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return setError('Amount must be greater than zero.');
    }

    setLoading(true);

    try {
      const response = await API.put(`/expenses/${expense._id}`, {
        amount: numericAmount,
        category: categoryId,
        description: description.trim(),
        date
      });

      setIsEditing(false);
      if (onExpenseUpdated) {
        onExpenseUpdated(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await API.delete(`/expenses/${expense._id}`);
      if (onExpenseDeleted) {
        onExpenseDeleted(expense._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  if (isEditing) {
    return (
      <li className="p-4 bg-gray-50 border border-indigo-200 rounded-lg shadow-sm">
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          <div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
            ${Number(expense.amount).toFixed(2)}
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900">{expense.category?.name || 'Uncategorized'}</span>
            <span className="text-xs text-gray-500">• {new Date(expense.date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600">{expense.description || 'No description'}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition"
          title="Edit Expense"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition"
          title="Delete Expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}