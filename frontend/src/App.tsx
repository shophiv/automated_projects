import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ProductsPage } from './modules/products/ProductsPage';
import { CategoriesPage } from './modules/categories/CategoriesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<div className="p-6 bg-white rounded-xl shadow"><h2 className="text-xl font-bold">Dashboard Home</h2></div>} />
            <Route path="/pos" element={<div className="p-6 bg-white rounded-xl shadow"><h2 className="text-xl font-bold">POS Terminal</h2></div>} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/team" element={<div className="p-6 bg-white rounded-xl shadow"><h2 className="text-xl font-bold">Team & Roles</h2></div>} />
            <Route path="/settings" element={<div className="p-6 bg-white rounded-xl shadow"><h2 className="text-xl font-bold">Workspace Settings</h2></div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;