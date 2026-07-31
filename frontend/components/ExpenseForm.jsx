import React, { useState, useEffect } from 'react';

function ExpenseForm({ onSubmitExpense, editingExpense, onCancelEdit, loading }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount);
      setCategory(editingExpense.category);
      setDate(editingExpense.date ? editingExpense.date.substring(0, 10) : '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().substring(0, 10));
    }
  }, [editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !amount || !category || !date) {
      setFormError('All fields are required.');
      return;
    }

    if (Number(amount) <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }

    onSubmitExpense({
      title,
      amount: Number(amount),
      category,
      date
    });

    if (!editingExpense) {
      setTitle('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().substring(0, 10));
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
      {formError && <div style={{ color: 'red', marginBottom: '10px', padding: '8px', background: '#ffe6e6', borderRadius: '4px' }}>{formError}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
            type="text"
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="e.g., Food, Transport"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 20px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;