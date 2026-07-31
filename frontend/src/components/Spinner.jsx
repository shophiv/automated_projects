import React from 'react';

function Spinner({ size = '24px', color = '#007BFF' }) {
  return (
    <div style={{ display: 'inline-block', textAlign: 'center', padding: '10px' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}33`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Spinner;