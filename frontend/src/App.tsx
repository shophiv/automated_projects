import React, { useState } from 'react';
import { authService, AuthResponse } from './services/authService';
import { isValidEmail } from './utils/validation';
import { ProductManager } from './components/products/ProductManager';

export function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && !tenantName.trim()) {
      setError('Tenant name is required.');
      return;
    }

    try {
      if (isLogin) {
        const res = await authService.login({ email, password });
        setAuthData(res);
      } else {
        const res = await authService.register({ tenantName, email, password });
        setAuthData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    }
  };

  if (authData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Smart Retail POS</h1>
            <p className="text-xs text-gray-500">Workspace: <span className="font-semibold">{authData.user.tenantName}</span> ({authData.user.email})</p>
          </div>
          <button
            onClick={() => setAuthData(null)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-semibold"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <ProductManager token={authData.token} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Smart Retail POS &amp; Business Management
        </h1>
        <div className="flex justify-center mb-6 border-b">
          <button
            className={`pb-2 px-4 font-semibold ${isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`pb-2 px-4 font-semibold ${!isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register Workspace
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Retailer / Workspace Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="My Retail Store"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@retail.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            {isLogin ? 'Sign In' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;