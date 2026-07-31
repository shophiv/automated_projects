import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import expenseService from '../../services/expenseService';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseTable from '../../components/ExpenseTable';
import axios from 'axios';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);
  const navigate = useNavigate();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses.');
      if (err.response?.status === 401) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchExpenses();
    }

    axios.get('http://localhost:5000/api/health')
      .then(res => setHealthStatus(res.data))
      .catch(() => setHealthStatus({ status: 'error' }));
  }, [navigate, fetchExpenses]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCreateOrUpdateExpense = async (expenseData) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, expenseData);
        setSuccess('Expense updated successfully!');
        setEditingExpense(null);
      } else {
        await expenseService.createExpense(expenseData);
        setSuccess('Expense created successfully!');
      }
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await expenseService.deleteExpense(id);
      setSuccess('Expense deleted successfully!');
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const totalExpenseAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Expense Tracker Dashboard</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Signed in as: <strong>{user?.email}</strong></span>
          <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e6ffed', borderRadius: '4px' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #ccc' }}>
          <h4>Total Expenses</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007BFF', margin: '5px 0 0 0' }}>${totalExpenseAmount.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #ccc' }}>
          <h4>System Status</h4>
          <p style={{ margin: '5px 0 0 0' }}><strong>Health:</strong> {healthStatus ? healthStatus.status : 'Checking...'}</p>
        </div>
      </div>

      <ExpenseForm
        onSubmitExpense={handleCreateOrUpdateExpense}
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
        loading={loading}
      />

      <ExpenseTable
        expenses={expenses}
        onEdit={(expense) => setEditingExpense(expense)}
        onDelete={handleDeleteExpense}
        loading={loading}
      />
    </div>
  );
}

export default DashboardPage;