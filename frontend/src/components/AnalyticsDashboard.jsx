import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Sparkles, TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await API.get('/analytics/insights');
      setAnalytics(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError('Failed to load AI analytics and spending insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6 text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Generating AI-powered financial insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
        {error}
      </div>
    );
  }

  const { summary, insights } = analytics || {};

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                <dd className="text-2xl font-semibold text-gray-900">${summary?.totalSpent?.toFixed(2) || '0.00'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-500 rounded-md p-3 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                <dd className="text-2xl font-semibold text-gray-900">{summary?.totalTransactions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 shadow rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 text-yellow-300 mr-2" />
          <h3 className="text-lg font-semibold text-white">AI Financial Advisor Insights</h3>
        </div>
        <div className="bg-indigo-800/60 rounded-md p-4 text-indigo-100 text-sm leading-relaxed whitespace-pre-line border border-indigo-600/50">
          {insights}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <PieIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
        </div>

        {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            {summary.categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>{cat.category}</span>
                  <span>${cat.total.toFixed(2)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(parseFloat(cat.percentage), 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No category breakdown available.</p>
        )}
      </div>
    </div>
  );
}