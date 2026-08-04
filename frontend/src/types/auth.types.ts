export interface User {
  id: number;
  tenant_id: number;
  email: string;
  role: 'admin' | 'retailer';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}