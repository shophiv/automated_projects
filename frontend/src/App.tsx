import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/login/LoginPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { LayoutDashboard, FolderTree, Package, LogOut } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RetailerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-indigo-600">Smart Retail POS</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                <FolderTree className="h-4 w-4" /> Categories
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.name} ({user?.role})</span>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
      <p className="text-gray-600 mb-8">Role: {user?.role} | Tenant Workspace ID: {user?.tenant_id}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Category Management</h3>
          <p className="text-gray-600 text-sm mb-4">Set up and organize product categories and classifications for your store inventory.</p>
          <Link to="/categories" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Manage Categories
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Product Catalog</h3>
          <p className="text-gray-600 text-sm mb-4">Add, edit, duplicate, barcode-scan, and organize your complete product inventory.</p>
          <Link to="/products" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><RetailerLayout><DashboardHome /></RetailerLayout></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><RetailerLayout><CategoriesPage /></RetailerLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><RetailerLayout><ProductsPage /></RetailerLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;