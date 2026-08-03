import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h2>Simple Expense Tracker</h2>
        <div>
          <span style={{ marginRight: '1rem' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ marginTop: '2rem' }}>
        <h3>Dashboard</h3>
        <p>Welcome to your expense tracker! Authentication session is active.</p>
      </main>
    </div>
  );
};

export default DashboardPage;