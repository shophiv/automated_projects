import React, { useState } from 'react';
import { createCategory } from '../api/categoryApi';
import FormInput from './common/FormInput';
import { validateCategoryName } from '../utils/validators';

export default function CategoryForm({ onCategoryCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateCategoryName(name)) {
      setError('Category name must be between 1 and 50 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await createCategory({ name: name.trim() });
      setLoading(false);
      setName('');
      setSuccessMessage('Category created successfully!');
      if (onCategoryCreated) {
        onCategoryCreated(response.data);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create category.');
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #e1e1e1', marginBottom: '20px' }}>
      <h3>Add New Category</h3>
      {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Food, Transport"
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 16px', background: '#28A745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}