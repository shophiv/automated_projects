import React, { useState, useEffect } from 'react';
import { getCategories } from '../api/categoryApi';
import { createExpense } from '../api/expenseApi';
import FormInput from './common/FormInput';
import { validateAmount, validateDate } from '../utils/validators';

export default function ExpenseForm({ onExpenseCreated }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
      if (res.data && res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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
      const response = await createExpense({
        categoryId: Number(categoryId),
        amount: Number(amount),
        date,
        description
      });
      setLoading(false);
      setAmount('');
      setDescription('');
      setSuccessMessage('Expense added successfully!');
      if (onExpenseCreated) {
        onExpenseCreated(response.data);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create expense.');
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #e1e1e1', marginBottom: '20px' }}>
      <h3>Add New Expense</h3>
      {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{successMessage}</div>}
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
          {categories.length === 0 && (
            <span style={{ fontSize: '12px', color: '#e67e22' }}>No categories found. Please create a category first.</span>
          )}
        </div>

        <FormInput
          label="Amount ($)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
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
          placeholder="Enter description..."
        />

        <button
          type="submit"
          disabled={loading || categories.length === 0}
          style={{ padding: '8px 16px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}