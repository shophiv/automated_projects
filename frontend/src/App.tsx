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
import { SuppliersPage } from './pages/retailer/suppliers/SuppliersPage';
import { PurchasesPage } from './pages/retailer/purchases/PurchasesPage';

const RetailerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="font-bold text-xl text-indigo-600">SmartRetail POS</span>
          <div className="flex space-x-4 text-sm font-medium text-gray-600">
            <Link to="/pos" className="hover:text-indigo-600">POS Checkout</Link>
            <Link to="/products" className="hover:text-indigo-600">Products</Link>
            <Link to="/categories" className="hover:text-indigo-600">Categories</Link>
            <Link to="/inventory" className="hover:text-indigo-600">Inventory</Link>
            <Link to="/sales" className="hover:text-indigo-600">Sales History</Link>
            <Link to="/suppliers" className="hover:text-indigo-600">Suppliers</Link>
            <Link to="/purchases" className="hover:text-indigo-600">Purchase Orders</Link>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Logout
        </button>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/pos"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <PosPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/products"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <ProductsPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/categories"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <CategoriesPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/inventory"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <InventoryPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/sales"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <SalesPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
      path="/suppliers"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <SuppliersPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/purchases"
          element={
            isAuthenticated ? (
              <RetailerLayout>
                <PurchasesPage />
              </RetailerLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/pos' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;