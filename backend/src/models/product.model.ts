export interface Product {
  id: number;
  tenant_id: number;
  name: string;
  sku: string;
  barcode: string | null;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  barcode?: string | null;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  barcode?: string | null;
  cost_price?: number;
  retail_price?: number;
  stock_quantity?: number;
}