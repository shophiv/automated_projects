import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CategoriesPage } from './pages/retailer/categories/CategoriesPage';
import { ProductsPage } from './pages/retailer/products/ProductsPage';
import { InventoryPage } from './pages/retailer/inventory/InventoryPage';
import { PosPage } from './pages/retailer/pos/PosPage';
import { SalesPage } from './pages/retailer/sales/SalesPage';

const RetailerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-800">Smart Retail POS</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/pos" className="block px-3 py-2 rounded hover:bg-gray-800">Point of Sale (POS)</Link>
          <Link to="/products" className="block px-3 py-2 rounded hover:bg-gray-800">Products</Link>
          <Link to="/categories" className="block px-3 py-2 rounded hover:bg-gray-800">Categories</Link>
          <Link to="/inventory" className="block px-3 py-2 rounded hover:bg-gray-800">Inventory</Link>
          <Link to="/sales" className="block px-3 py-2 rounded hover:bg-gray-800">Sales History</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Retailer Portal Routes */}
        <Route
          path="/pos"
          element={
            <RetailerLayout>
              <PosPage />
            </RetailerLayout>
          }
        />
        <Route
          path="/products"
          element={
            <RetailerLayout>
              <ProductsPage />
            </RetailerLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <RetailerLayout>
              <CategoriesPage />
            </RetailerLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <RetailerLayout>
              <InventoryPage />
            </RetailerLayout>
          }
        />
        <Route
          path="/sales"
          element={
            <RetailerLayout>
              <SalesPage />
            </RetailerLayout>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;