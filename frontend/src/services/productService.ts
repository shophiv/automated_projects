import { api } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  archived: boolean;
}

export interface Product {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  sku: string;
  barcode?: string;
  brand?: string;
  purchase_price: number;
  selling_price: number;
  wholesale_price?: number;
  discount_price?: number;
  tax_rate?: number;
  unit: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  image_url?: string;
  description?: string;
  active: boolean;
}

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories');
    return res.data.data;
  },
  async createCategory(data: { name: string; description?: string }) {
    const res = await api.post('/categories', data);
    return res.data.data;
  },
  async updateCategory(id: string, data: { name: string; description?: string; archived?: boolean }) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data.data;
  },
  async deleteCategory(id: string) {
    const res = await api.delete(`/categories/${id}`);
    return res.data.data;
  }
};

export const productService = {
  async getProducts(search?: string, categoryId?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    const res = await api.get(`/products?${params.toString()}`);
    return res.data.data;
  },
  async createProduct(data: any) {
    const res = await api.post('/products', data);
    return res.data.data;
  },
  async updateProduct(id: string, data: any) {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },
  async deleteProduct(id: string) {
    const res = await api.delete(`/products/${id}`);
    return res.data.data;
  },
  async duplicateProduct(id: string) {
    const res = await api.post(`/products/${id}/duplicate`);
    return res.data.data;
  },
  async getMargins() {
    const res = await api.get('/pricing/margins');
    return res.data.data;
  },
  async updateMargins(margin: number) {
    const res = await api.put('/pricing/margins', { margin });
    return res.data.data;
  }
};