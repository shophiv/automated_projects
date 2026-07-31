import React from 'react';

function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const bgColor = isError ? '#ffe6e6' : '#d4edda';
  const textColor = isError ? '#721c24' : '#155724';
  const borderColor = isError ? '#f5c6cb' : '#c3e6cb';

  return (
    <div style={{
      padding: '12px 15px',
      marginBottom: '15px',
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.95rem'
    }}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: textColor,
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: '10px'
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default Alert;