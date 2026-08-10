import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process request.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        </div>
        {message && <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">{message}</div>}
        {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <input
            type="email"
            required
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Send Reset Instructions
            </button>
          </div>
          <div className="text-center">
            <Link to="/auth/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};