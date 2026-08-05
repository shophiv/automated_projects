const API_BASE = '/api/v1';

export interface Product {
  id: number;
  tenant_id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  barcode?: string;
  status: 'active' | 'archived';
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  barcode?: string;
  initialQuantity?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductDTO {
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  barcode?: string;
}

export const productService = {
  async getProducts(token: string): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch products');
    return json.data;
  },

  async createProduct(token: string, dto: CreateProductDTO): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create product');
    return json.data;
  },

  async updateProduct(token: string, id: number, dto: UpdateProductDTO): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update product');
    return json.data;
  },

  async deleteProduct(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to delete product');
  },

  async duplicateProduct(token: string, id: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to duplicate product');
    return json.data;
  },

  async archiveProduct(token: string, id: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to archive product');
    return json.data;
  },

  async updateInventory(token: string, productId: number, quantity: number, lowStockThreshold?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity, lowStockThreshold }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update inventory');
    return json.data;
  },
};