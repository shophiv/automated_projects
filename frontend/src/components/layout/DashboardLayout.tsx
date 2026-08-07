import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Package, ShoppingCart, Users, Settings } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-indigo-400">Smart Retail</h1>
          <p className="text-xs text-slate-400 mt-1">Workspace: {user?.role || 'User'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => navigate('/pos')} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <ShoppingCart size={20} /> POS Terminal
          </button>
          <button onClick={() => navigate('/inventory')} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <Package size={20} /> Inventory
          </button>
          <button onClick={() => navigate('/users')} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <Users size={20} /> Users & Staff
          </button>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <Settings size={20} /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Retailer Portal</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">{user?.name} ({user?.email})</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};