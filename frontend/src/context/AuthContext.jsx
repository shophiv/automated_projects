import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/authApi';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user', e);
        }
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setLoading(false);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser({ email, password });
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setLoading(false);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);