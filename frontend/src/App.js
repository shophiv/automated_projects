import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(response => {
        setHealthStatus(response.data);
        setLoading(false);
      })
      .catch(error => {
        setHealthStatus({ status: 'error', message: error.message });
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Expense Tracker Foundation</h1>
      <p>System status and connection readiness:</p>
      {loading ? (
        <p>Loading system status...</p>
      ) : (
        <div style={{ padding: '20px', background: '#f4f4f4', display: 'inline-block', borderRadius: '5px' }}>
          <p><strong>Status:</strong> {healthStatus.status}</p>
          <p><strong>Database:</strong> {healthStatus.db || 'offline'}</p>
        </div>
      )}
    </div>
  );
}

export default App;