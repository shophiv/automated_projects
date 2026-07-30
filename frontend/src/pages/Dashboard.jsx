import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { LogOut, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, catRes] = await Promise.all([
          API.get('/expenses'),
          API.get('/categories')
        ]);
        setExpenses(expRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-indigo-600 font-medium text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">AI Expense Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hello, <span className="font-medium">{user?.email}</span></span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{expenses.length}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Categories</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{categories.length}</dd>
            </div>
          </div>

          <ExpenseForm onExpenseAdded={handleExpenseAdded} />

          <ExpenseList 
            expenses={expenses} 
            setExpenses={setExpenses} 
            categories={categories} 
          />
        </div>
      </main>
    </div>
  );
}