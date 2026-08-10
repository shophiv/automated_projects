import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CategoriesPage } from './pages/retailer/categories/CategoriesPage';
import { ProductsPage } from './pages/retailer/products/ProductsPage';
import { InventoryPage } from './pages/retailer/inventory/InventoryPage';
import { PosPage } from './pages/retailer/pos/PosPage';
import { SalesPage } from './pages/retailer/sales/SalesPage';
import { SuppliersPage } from './pages/retailer/suppliers/SuppliersPage';
import { PurchasesPage } from './pages/retailer/purchases/PurchasesPage';
import { DashboardPage } from './pages/retailer/dashboard/DashboardPage';
import { AnalyticsPage } from './pages/retailer/analytics/AnalyticsPage';
import { AccountingPage } from './pages/retailer/accounting/AccountingPage';
import { ReportsPage } from './pages/retailer/reports/ReportsPage';
import { apiClient } from './services/apiClient';

const RetailerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-5 text-xl font-bold tracking-wider border-b border-slate-700">Smart Retail POS</div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Dashboard</Link>
          <Link to="/pos" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Point of Sale (POS)</Link>
          <Link to="/products" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Products Catalog</Link>
          <Link to="/categories" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Categories</Link>
          <Link to="/inventory" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Inventory & Stock</Link>
          <Link to="/sales" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Sales History</Link>
          <Link to="/suppliers" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Suppliers</Link>
          <Link to="/purchases" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Purchase Orders</Link>
          <Link to="/analytics" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Analytics & AI</Link>
          <Link to="/accounting" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Accounting</Link>
          <Link to="/reports" className="block px-4 py-2.5 rounded hover:bg-slate-700 font-medium">Reports & Export</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full bg-rose-600 py-2 rounded text-sm font-medium hover:bg-rose-700">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <RetailerLayout>{children}</RetailerLayout> : <Navigate to="/login" />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute><PosPage /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><SuppliersPage /></PrivateRoute>} />
        <Route path="/purchases" element={<PrivateRoute><PurchasesPage /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        <Route path="/accounting" element={<PrivateRoute><AccountingPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;