import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryForm from '../components/CategoryForm';
import ExpenseForm from '../components/ExpenseForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '30px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Simple Expense Tracker</h2>
        <div>
          <span style={{ marginRight: '15px', color: '#555' }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{ padding: '6px 12px', background: '#DC3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <CategoryForm onCategoryCreated={handleRefresh} />
        </div>
        <div>
          <ExpenseForm key={refreshKey} onExpenseCreated={handleRefresh} />
        </div>
      </div>
    </div>
  );
}