const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export const authApi = {
  login: async (email: string, password: string, tenantId?: number) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, tenantId }),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to login');
    }
    return data.data;
  },

  getSession: async (token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/session`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch session');
    }
    return data.data;
  },
};