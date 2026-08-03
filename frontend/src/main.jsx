import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1>Simple Expense Tracker</h1>
      <p>Welcome, <strong>{user.email}</strong>!</p>
      <p>Authentication Phase successfully completed.</p>
      <button
        onClick={logout}
        style={{ padding: '10px 20px', background: '#DC3545', color: '#white', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff' }}
      >
        Logout
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </React.StrictMode>
);