import { apiRequest } from './client';

export interface Product {
  id: number;
  tenant_id: number;
  name: string;
  sku: string;
  barcode: string | null;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  barcode?: string | null;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await apiRequest('/products');
  return data.products;
}

export async function fetchProductById(id: number): Promise<Product> {
  const data = await apiRequest(`/products/${id}`);
  return data.product;
}

export async function createProduct(productData: ProductInput): Promise<Product> {
  const data = await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return data.product;
}

export async function updateProduct(id: number, productData: Partial<ProductInput>): Promise<Product> {
  const data = await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return data.product;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}