import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      setExpenses(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();

    // WebSocket real-time sync listeners
    const socket = getSocket();
    if (socket) {
      const handleExpenseCreated = (newExpense) => {
        setExpenses((prev) => [newExpense, ...prev]);
      };

      const handleExpenseUpdated = (updatedExpense) => {
        setExpenses((prev) =>
          prev.map((exp) => (exp._id === updatedExpense._id ? updatedExpense : exp))
        );
      };

      const handleExpenseDeleted = ({ id }) => {
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      };

      socket.on('expenseCreated', handleExpenseCreated);
      socket.on('expenseUpdated', handleExpenseUpdated);
      socket.on('expenseDeleted', handleExpenseDeleted);

      return () => {
        socket.off('expenseCreated', handleExpenseCreated);
        socket.off('expenseUpdated', handleExpenseUpdated);
        socket.off('expenseDeleted', handleExpenseDeleted);
      };
    }
  }, [fetchExpenses, fetchCategories]);

  const handleExpenseAdded = (newExpense) => {
    // If WebSocket already added it, avoid duplicate
    setExpenses((prev) => {
      if (prev.some((e) => e._id === newExpense._id)) return prev;
      return [newExpense, ...prev];
    });
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp._id === updatedExpense._id ? updatedExpense : exp))
    );
  };

  const handleExpenseDeleted = (deletedId) => {
    setExpenses((prev) => prev.filter((exp) => exp._id !== deletedId));
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Expense Tracker</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <div className="flex space-x-3 items-center">
            <button
              onClick={() => navigate('/analytics')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              AI Insights & Analytics
            </button>
            <button
              onClick={logout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <div className="mb-6 bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500 truncate">Total Expenses Recorded</p>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-3xl font-semibold text-gray-900">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Expense</h2>
              <ExpenseForm categories={categories} onExpenseAdded={handleExpenseAdded} />
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Expenses</h2>
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading expenses...</div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  categories={categories}
                  onUpdate={handleExpenseUpdated}
                  onDelete={handleExpenseDeleted}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;