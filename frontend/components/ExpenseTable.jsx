import React from 'react';

function ExpenseTable({ expenses, onEdit, onDelete, loading }) {
  if (loading && expenses.length === 0) {
    return <p>Loading expenses...</p>;
  }

  if (expenses.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No expenses recorded yet. Add one above!</p>;
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '5px', border: '1px solid #ccc', overflowX: 'auto' }}>
      <h3>Your Expenses</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', background: '#f8f9fa' }}>
            <th style={{ padding: '10px' }}>Title</th>
            <th style={{ padding: '10px' }}>Category</th>
            <th style={{ padding: '10px' }}>Amount</th>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '10px' }}>{expense.title}</td>
              <td style={{ padding: '10px' }}>
                <span style={{ padding: '3px 8px', background: '#e9ecef', borderRadius: '12px', fontSize: '0.85rem' }}>
                  {expense.category}
                </span>
              </td>
              <td style={{ padding: '10px', fontWeight: 'bold', color: '#28a745' }}>
                ${Number(expense.amount).toFixed(2)}
              </td>
              <td style={{ padding: '10px' }}>{new Date(expense.date).toLocaleDateString()}</td>
              <td style={{ padding: '10px', textAlign: 'right' }}>
                <button
                  onClick={() => onEdit(expense)}
                  style={{ marginRight: '8px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(expense._id)}
                  style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;