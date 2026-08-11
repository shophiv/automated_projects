import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await apiClient.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading platform analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Platform Administration Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-gray-500 text-sm font-medium">Total Retailers</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.total_retailers}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-gray-500 text-sm font-medium">Active Retailers</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{analytics?.active_retailers}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">${analytics?.monthly_revenue?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-gray-500 text-sm font-medium">System Uptime</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">99.9%</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">System Health Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>Database Status:</span>
            <span className="font-bold text-green-600">{analytics?.system_health?.database_status}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>Redis Status:</span>
            <span className="font-bold text-green-600">{analytics?.system_health?.redis_status}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>Server Uptime (seconds):</span>
            <span className="font-bold">{Math.floor(analytics?.system_health?.uptime || 0)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};