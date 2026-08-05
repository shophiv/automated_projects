import { ProductRepository } from '../repositories/product.repository.js';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/product.model.js';

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async getProducts(tenantId: number): Promise<Product[]> {
    return this.productRepository.findAllByTenant(tenantId);
  }

  async getProductById(id: number, tenantId: number): Promise<Product> {
    const product = await this.productRepository.findByIdAndTenant(id, tenantId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(tenantId: number, dto: CreateProductDTO): Promise<Product> {
    if (!dto.name || !dto.sku) {
      throw new Error('Product name and SKU are required');
    }
    if (dto.cost_price < 0 || dto.retail_price < 0 || dto.stock_quantity < 0) {
      throw new Error('Prices and stock quantity cannot be negative');
    }
    return this.productRepository.create(tenantId, dto);
  }

  async updateProduct(id: number, tenantId: number, dto: UpdateProductDTO): Promise<Product> {
    if (dto.cost_price !== undefined && dto.cost_price < 0) {
      throw new Error('Cost price cannot be negative');
    }
    if (dto.retail_price !== undefined && dto.retail_price < 0) {
      throw new Error('Retail price cannot be negative');
    }
    if (dto.stock_quantity !== undefined && dto.stock_quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const updated = await this.productRepository.update(id, tenantId, dto);
    if (!updated) {
      throw new Error('Product not found or unauthorized');
    }
    return updated;
  }

  async deleteProduct(id: number, tenantId: number): Promise<void> {
    const deleted = await this.productRepository.delete(id, tenantId);
    if (!deleted) {
      throw new Error('Product not found or unauthorized');
    }
  }
}