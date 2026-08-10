import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CategoriesPage } from './pages/retailer/categories/CategoriesPage';
import { ProductsPage } from './pages/retailer/products/ProductsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/retailer/categories" element={<CategoriesPage />} />
        <Route path="/retailer/products" element={<ProductsPage />} />
        <Route path="/dashboard" element={<div className="p-8 text-2xl font-bold">Dashboard Placeholder (Phase 2 Complete)</div>} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;