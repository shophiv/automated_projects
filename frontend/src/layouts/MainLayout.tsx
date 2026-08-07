import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, LogOut, LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Settings } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
            <Store className="h-8 w-8 text-indigo-400" />
            <span className="text-lg font-bold tracking-wide">Smart Retail</span>
          </div>
          <nav className="p-4 space-y-1">
            <a
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/dashboard') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 text-indigo-400" />
              <span>Dashboard</span>
            </a>
            <a
              href="/pos"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/pos') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              <span>POS Terminal</span>
            </a>
            <a
              href="/products"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/products') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Package className="h-5 w-5 text-indigo-400" />
              <span>Products</span>
            </a>
            <a
              href="/categories"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/categories') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FolderTree className="h-5 w-5 text-indigo-400" />
              <span>Categories</span>
            </a>
            <a
              href="/team"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/team') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Team & Roles</span>
            </a>
            <a
              href="/settings"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                isActive('/settings') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Settings className="h-5 w-5 text-indigo-400" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-white">{user?.name || 'Retail User'}</p>
            <p className="text-xs text-slate-400 uppercase">{user?.role || 'Owner'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-slate-800">Workspace Management</h1>
          <div className="text-sm text-slate-500">
            Connected Workspace
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};