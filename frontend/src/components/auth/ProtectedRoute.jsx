import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/authApi';

export const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};