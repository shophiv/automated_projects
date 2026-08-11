import { ProductRepository } from './product.repository';

export class ProductService {
  private productRepository = new ProductRepository();

  async createProduct(retailerId: number, data: any) {
    if (!data.name || !data.sku) {
      throw new Error('Product name and SKU are required');
    }
    return await this.productRepository.create(retailerId, data);
  }

  async getProducts(retailerId: number, queryParams: any) {
    return await this.productRepository.findAll(retailerId, queryParams);
  }

  async getProductById(productId: number, retailerId: number) {
    const product = await this.productRepository.findById(productId, retailerId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async updateProduct(productId: number, retailerId: number, data: any) {
    const existing = await this.productRepository.findById(productId, retailerId);
    if (!existing) {
      throw new Error('Product not found');
    }
    return await this.productRepository.update(productId, retailerId, data);
  }

  async archiveProduct(productId: number, retailerId: number) {
    const existing = await this.productRepository.findById(productId, retailerId);
    if (!existing) {
      throw new Error('Product not found');
    }
    return await this.productRepository.update(productId, retailerId, { status: 'archived' });
  }

  async deleteProduct(productId: number, retailerId: number) {
    const existing = await this.productRepository.findById(productId, retailerId);
    if (!existing) {
      throw new Error('Product not found');
    }
    return await this.productRepository.delete(productId, retailerId);
  }

  async duplicateProduct(productId: number, retailerId: number) {
    const existing = await this.productRepository.findById(productId, retailerId);
    if (!existing) {
      throw new Error('Product not found');
    }
    return await this.productRepository.duplicate(productId, retailerId);
  }
}