import React, { useState, useEffect } from 'react';
import { updateExpense } from '../api/expenseApi';
import FormInput from './common/FormInput';
import { validateAmount, validateDate } from '../utils/validators';

export default function ExpenseEditModal({ expense, categories, onClose, onUpdated }) {
  const [categoryId, setCategoryId] = useState(expense.category_id || '');
  const [amount, setAmount] = useState(expense.amount || '');
  const [date, setDate] = useState(expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!validateAmount(amount)) {
      setError('Amount must be a valid positive number.');
      return;
    }
    if (!validateDate(date)) {
      setError('Date must be in valid YYYY-MM-DD format.');
      return;
    }
    if (description && description.length > 255) {
      setError('Description cannot exceed 255 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await updateExpense(expense.id, {
        categoryId: Number(categoryId),
        amount: Number(amount),
        date,
        description
      });
      setLoading(false);
      if (onUpdated) {
        onUpdated(response.data);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to update expense.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%', boxSizing: 'border-box' }}>
        <h3>Edit Expense</h3>
        {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <FormInput
            label="Amount ($)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <FormInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <FormInput
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}