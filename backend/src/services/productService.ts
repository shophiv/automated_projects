import { ProductRepository, Product } from '../repositories/productRepository';

export class ProductService {
  static async createProduct(tenantId: string, data: any): Promise<Product> {
    return ProductRepository.create(tenantId, data);
  }

  static async getProducts(
    tenantId: string,
    search?: string,
    categoryId?: string,
    limit = 50,
    offset = 0
  ): Promise<{ products: Product[]; total: number }> {
    return ProductRepository.findPaginated(tenantId, search, categoryId, limit, offset);
  }

  static async getProductById(tenantId: string, id: string): Promise<Product> {
    const product = await ProductRepository.findById(tenantId, id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return product;
  }

  static async updateProduct(tenantId: string, id: string, data: any): Promise<Product> {
    const product = await ProductRepository.update(tenantId, id, data);
    if (!product) {
      throw new Error('Product not found.');
    }
    return product;
  }

  static async archiveProduct(tenantId: string, id: string): Promise<void> {
    const success = await ProductRepository.archive(tenantId, id);
    if (!success) {
      throw new Error('Product not found.');
    }
  }

  static async duplicateProduct(tenantId: string, id: string): Promise<Product> {
    const product = await ProductRepository.duplicate(tenantId, id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return product;
  }
}