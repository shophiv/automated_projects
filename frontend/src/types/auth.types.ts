export interface User {
  id: number;
  tenant_id: number;
  email: string;
  role: 'admin' | 'retailer';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SessionResponse {
  user: User;
}