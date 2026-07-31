import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import axios from 'axios';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }

    axios.get('http://localhost:5000/api/health')
      .then(res => setHealthStatus(res.data))
      .catch(err => setHealthStatus({ status: 'error' }));
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>
        <h2>Expense Tracker Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Welcome, {user?.email}</h3>
        <p>Your authentication session is active and verified.</p>
        <p><strong>System Health:</strong> {healthStatus ? healthStatus.status : 'Checking...'}</p>
      </div>
    </div>
  );
}

export default DashboardPage;