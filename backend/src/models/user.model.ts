export interface User {
  id: number;
  tenant_id: number | null;
  email: string;
  password_hash: string;
  role: 'admin' | 'retailer';
  created_at: Date;
  updated_at: Date;
}

export interface Tenant {
  id: number;
  name: string;
  subscription_status: string;
  created_at: Date;
  updated_at: Date;
}