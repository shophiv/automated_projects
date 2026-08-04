import { ProductRepository, CategoryEntity, ProductEntity } from './product.repository';
import { AppError } from '../../middleware/error.middleware';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getCategories(tenantId: number): Promise<CategoryEntity[]> {
    return this.productRepository.findCategoriesByTenant(tenantId);
  }

  async createCategory(tenantId: number, name: string): Promise<CategoryEntity> {
    return this.productRepository.createCategory(tenantId, name);
  }

  async updateCategory(id: number, tenantId: number, name: string): Promise<CategoryEntity> {
    const category = await this.productRepository.updateCategory(id, tenantId, name);
    if (!category) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async deleteCategory(id: number, tenantId: number): Promise<void> {
    const success = await this.productRepository.deleteCategory(id, tenantId);
    if (!success) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
  }

  async getProducts(tenantId: number, search?: string, categoryId?: number): Promise<ProductEntity[]> {
    return this.productRepository.findProductsByTenant(tenantId, search, categoryId);
  }

  async getProductById(id: number, tenantId: number): Promise<ProductEntity> {
    const product = await this.productRepository.findProductById(id, tenantId);
    if (!product) {
      const error: AppError = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getProductByBarcode(barcode: string, tenantId: number): Promise<ProductEntity> {
    const product = await this.productRepository.findProductByBarcode(barcode, tenantId);
    if (!product) {
      const error: AppError = new Error('Product not found with barcode');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(
    tenantId: number,
    categoryId: number | null,
    name: string,
    sku: string,
    barcode: string | null,
    purchasePrice: number,
    sellingPrice: number
  ): Promise<ProductEntity> {
    if (categoryId) {
      const category = await this.productRepository.findCategoryById(categoryId, tenantId);
      if (!category) {
        const error: AppError = new Error('Selected category does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    try {
      return await this.productRepository.createProduct(
        tenantId,
        categoryId,
        name,
        sku,
        barcode,
        purchasePrice,
        sellingPrice
      );
    } catch (err: any) {
      if (err.code === '23505') {
        const error: AppError = new Error('Product with this SKU or barcode already exists');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async updateProduct(
    id: number,
    tenantId: number,
    categoryId: number | null,
    name: string,
    sku: string,
    barcode: string | null,
    purchasePrice: number,
    sellingPrice: number
  ): Promise<ProductEntity> {
    if (categoryId) {
      const category = await this.productRepository.findCategoryById(categoryId, tenantId);
      if (!category) {
        const error: AppError = new Error('Selected category does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    try {
      const product = await this.productRepository.updateProduct(
        id,
        tenantId,
        categoryId,
        name,
        sku,
        barcode,
        purchasePrice,
        sellingPrice
      );
      if (!product) {
        const error: AppError = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }
      return product;
    } catch (err: any) {
      if (err.code === '23505') {
        const error: AppError = new Error('Product with this SKU or barcode already exists');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async deleteProduct(id: number, tenantId: number): Promise<void> {
    const success = await this.productRepository.deleteProduct(id, tenantId);
    if (!success) {
      const error: AppError = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
  }
}