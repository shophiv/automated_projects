import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { LogOut, Sparkles, PieChart } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses');
      setExpenses(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch expenses', err);
      setError('Failed to load expense entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses(expenses.map(exp => exp._id === updatedExpense._id ? updatedExpense : exp));
  };

  const handleExpenseDeleted = (deletedId) => {
    setExpenses(expenses.filter(exp => exp._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">AI Expense Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" /> AI Analytics
            </button>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <LogOut className="h-4 w-4 mr-1.5 text-gray-500" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ExpenseForm onExpenseAdded={handleExpenseAdded} />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <ExpenseList
          expenses={expenses}
          loading={loading}
          onExpenseUpdated={handleExpenseUpdated}
          onExpenseDeleted={handleExpenseDeleted}
        />
      </main>
    </div>
  );
}