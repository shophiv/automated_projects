import { apiClient } from './auth.api';
import { Category, Product, CreateCategoryPayload, CreateProductPayload, UpdateProductPayload } from '../types/product.types';

export const productApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data.data.categories;
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const response = await apiClient.post('/categories', payload);
    return response.data.data.category;
  },

  updateCategory: async (id: number, payload: CreateCategoryPayload): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data.data.category;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  getProducts: async (search?: string, categoryId?: number): Promise<Product[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    const response = await apiClient.get('/products', { params });
    return response.data.data.products;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data.product;
  },

  getProductByBarcode: async (barcode: string): Promise<Product> => {
    const response = await apiClient.get(`/products/barcode/${barcode}`);
    return response.data.data.product;
  },

  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await apiClient.post('/products', payload);
    return response.data.data.product;
  },

  updateProduct: async (id: number, payload: UpdateProductPayload): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data.data.product;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  }
};