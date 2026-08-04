export interface Category {
  id: number;
  tenant_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number | null;
  category_name?: string;
  name: string;
  sku: string;
  barcode: string | null;
  purchase_price: number;
  selling_price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface CreateProductPayload {
  categoryId?: number | null;
  name: string;
  sku: string;
  barcode?: string | null;
  purchasePrice: number;
  sellingPrice: number;
}

export interface UpdateProductPayload extends CreateProductPayload {}