import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

export const AccountingPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const fetchAccountingData = async () => {
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        apiClient.get('/accounting/entries'),
        apiClient.get('/accounting/summary'),
      ]);
      setEntries(entriesRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Failed to fetch accounting data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/accounting/expenses', {
        category,
        amount: parseFloat(amount),
        description,
      });
      setShowModal(false);
      setAmount('');
      setDescription('');
      fetchAccountingData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to record expense');
    }
  };

  if (loading) return <div className="p-6">Loading accounting ledger...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Accounting & Bookkeeping</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 font-medium"
        >
          Record Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Income</p>
            <p className="text-3xl font-bold text-green-600 mt-2">${summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${summary.totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Net Profit</p>
            <p className={`text-3xl font-bold mt-2 ${summary.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
              ${summary.netProfit.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Journal & Ledger Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: any) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3">{new Date(entry.date).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs uppercase font-semibold ${
                        entry.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{entry.category}</td>
                  <td className="p-3 text-gray-600">{entry.description || '-'}</td>
                  <td className={`p-3 font-bold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.type === 'income' ? '+' : '-'}${parseFloat(entry.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Record Business Expense</h2>
            <form onSubmit={handleRecordExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full border rounded p-2"
                >
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salary">Salary</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 px-4 py-2 rounded text-white font-medium hover:bg-indigo-700"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};