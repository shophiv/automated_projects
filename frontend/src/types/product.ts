export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string;
  supplier_id?: string;
  name: string;
  sku: string;
  barcode: string;
  brand?: string;
  purchase_price: number;
  selling_price: number;
  wholesale_price?: number;
  discount_price?: number;
  tax_rate: number;
  unit: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  image_url?: string;
  description?: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  category?: Category;
}