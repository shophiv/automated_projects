import axios from 'axios';
import { LoginRequest, LoginResponse, SessionResponse } from '../types/auth.types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  },

  getSession: async (): Promise<SessionResponse> => {
    const response = await apiClient.get('/auth/session');
    return response.data.data;
  }
};