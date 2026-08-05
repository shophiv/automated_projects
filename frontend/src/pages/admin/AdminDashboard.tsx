import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

interface Tenant {
  id: number;
  name: string;
  subscription_status: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiRequest('/admin/tenants')
      .then((data) => {
        setTenants(data.tenants);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading admin portal...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Portal - Smart Retail POS</h1>
          <button
            onClick={handleLogout}
            className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Workspace Tenants</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <li key={tenant.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-indigo-600">{tenant.name}</p>
                  <p className="text-sm text-gray-500">Created: {new Date(tenant.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tenant.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.subscription_status}
                  </span>
                </div>
              </li>
            ))}
            {tenants.length === 0 && (
              <li className="px-6 py-4 text-center text-gray-500">No tenants found.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};