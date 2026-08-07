export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant_id: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}