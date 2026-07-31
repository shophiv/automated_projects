import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../api/authApi';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-gray-700">Welcome to your Dashboard!</h2>
            <p className="text-gray-500 mt-2">Authentication successful. Future phase features will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};