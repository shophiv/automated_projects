import React from 'react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = ''
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '10px',
          borderRadius: '4px',
          border: error ? '1px solid red' : '1px solid #ccc',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
          width: '100%'
        }}
      />
      {error && <span style={{ fontSize: '12px', color: 'red' }}>{error}</span>}
    </div>
  );
}