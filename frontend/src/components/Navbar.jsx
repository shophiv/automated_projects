import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      background: '#343a40',
      color: '#fff',
      marginBottom: '20px'
    }}>
      <div>
        <Link to={token ? '/dashboard' : '/login'} style={{ color: '#fff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Expense Tracker
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {token ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#adb5bd' }}>
              {user && user.email ? `Logged in as ${user.email}` : ''}
            </span>
            <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;