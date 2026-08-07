import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<div className="p-6 bg-white rounded-xl shadow"><h3 className="text-xl font-bold">Dashboard Placeholder</h3><p className="text-gray-500 mt-2">Core architecture and authentication foundation fully established.</p></div>} />
            <Route path="pos" element={<div className="p-6 bg-white rounded-xl shadow"><h3 className="text-xl font-bold">POS Terminal Placeholder</h3></div>} />
            <Route path="inventory" element={<div className="p-6 bg-white rounded-xl shadow"><h3 className="text-xl font-bold">Inventory Management Placeholder</h3></div>} />
            <Route path="users" element={<div className="p-6 bg-white rounded-xl shadow"><h3 className="text-xl font-bold">Staff & Users Management Placeholder</h3></div>} />
            <Route path="settings" element={<div className="p-6 bg-white rounded-xl shadow"><h3 className="text-xl font-bold">System Settings Placeholder</h3></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;