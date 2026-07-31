import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import expenseService from '../../services/expenseService';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseTable from '../../components/ExpenseTable';
import Navbar from '../../components/Navbar';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const navigate = useNavigate();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load expenses.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchExpenses();
  }, [navigate, fetchExpenses]);

  const handleAddOrUpdateExpense = async (expenseData) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, expenseData);
        setSuccessMessage('Expense updated successfully.');
        setEditingExpense(null);
      } else {
        await expenseService.createExpense(expenseData);
        setSuccessMessage('Expense created successfully.');
      }
      await fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save expense.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await expenseService.deleteExpense(id);
      setSuccessMessage('Expense deleted successfully.');
      await fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete expense.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ marginBottom: '25px', color: '#333' }}>Expense Management Dashboard</h1>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />

        <ExpenseForm
          onSubmitExpense={handleAddOrUpdateExpense}
          editingExpense={editingExpense}
          onCancelEdit={handleCancelEdit}
          loading={actionLoading}
        />

        {loading && expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner size="40px" />
            <p style={{ marginTop: '10px', color: '#666' }}>Loading your financial data...</p>
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;