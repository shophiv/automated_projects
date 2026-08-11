import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/retailer/dashboard/DashboardPage';
import { ProductsPage } from './pages/retailer/products/ProductsPage';
import { CategoriesPage } from './pages/retailer/categories/CategoriesPage';
import { InventoryPage } from './pages/retailer/inventory/InventoryPage';
import { PosPage } from './pages/retailer/pos/PosPage';
import { SalesPage } from './pages/retailer/sales/SalesPage';
import { SuppliersPage } from './pages/retailer/suppliers/SuppliersPage';
import { PurchasesPage } from './pages/retailer/purchases/PurchasesPage';
import { AnalyticsPage } from './pages/retailer/analytics/AnalyticsPage';
import { AccountingPage } from './pages/retailer/accounting/AccountingPage';
import { ReportsPage } from './pages/retailer/reports/ReportsPage';
import { SettingsPage } from './pages/retailer/settings/SettingsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRetailersPage } from './pages/admin/AdminRetailersPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Retailer portal routes */}
        <Route path="/retailer/dashboard" element={<DashboardPage />} />
        <Route path="/retailer/products" element={<ProductsPage />} />
        <Route path="/retailer/categories" element={<CategoriesPage />} />
        <Route path="/retailer/inventory" element={<InventoryPage />} />
        <Route path="/retailer/pos" element={<PosPage />} />
        <Route path="/retailer/sales" element={<SalesPage />} />
        <Route path="/retailer/suppliers" element={<SuppliersPage />} />
        <Route path="/retailer/purchases" element={<PurchasesPage />} />
        <Route path="/retailer/analytics" element={<AnalyticsPage />} />
        <Route path="/retailer/accounting" element={<AccountingPage />} />
        <Route path="/retailer/reports" element={<ReportsPage />} />
        <Route path="/retailer/settings" element={<SettingsPage />} />

        {/* Admin portal routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/retailers" element={<AdminRetailersPage />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;