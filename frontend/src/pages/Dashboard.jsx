import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const response = await api.get('/expenses');
      setExpenses(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">AI Expense Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, <span className="font-semibold">{user?.email}</span></span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Expense Form */}
          <div className="lg:col-span-1">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>

          {/* Right Column: Analytics & Expense List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Total Expenses</h3>
              <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                ${calculateTotal()}
              </div>
              <p className="mt-1 text-sm text-gray-500">{expenses.length} expense(s) logged</p>
            </div>

            {/* Expenses List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Expenses</h3>
              </div>
              {loadingExpenses ? (
                <div className="text-center py-6 text-gray-500">Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No expenses logged yet. Add your first expense above!</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <li key={expense._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{expense.category?.name || 'Uncategorized'}</span>
                        <span className="text-sm text-gray-600">{expense.description || 'No description'}</span>
                        <span className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900">${Number(expense.amount).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;