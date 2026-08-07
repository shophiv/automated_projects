import { ProductRepository } from './product.repository';
import { CategoryRepository } from '../categories/category.repository';

export class ProductService {
  private productRepo = new ProductRepository();
  private categoryRepo = new CategoryRepository();

  async getProducts(tenantId: string, filters?: { category_id?: string; search?: string; is_archived?: boolean }) {
    return await this.productRepo.findAll(tenantId, filters);
  }

  async getProductById(id: string, tenantId: string) {
    const product = await this.productRepo.findById(id, tenantId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(tenantId: string, data: any) {
    const category = await this.categoryRepo.findById(data.category_id, tenantId);
    if (!category) {
      throw new Error('Invalid category specified');
    }

    const existing = await this.productRepo.findBySkuOrBarcode(tenantId, data.sku, data.barcode);
    if (existing) {
      throw new Error('Product with this SKU or Barcode already exists in your workspace');
    }

    return await this.productRepo.create({
      tenant_id: tenantId,
      ...data,
    });
  }

  async updateProduct(id: string, tenantId: string, data: any) {
    await this.getProductById(id, tenantId);

    if (data.category_id) {
      const category = await this.categoryRepo.findById(data.category_id, tenantId);
      if (!category) {
        throw new Error('Invalid category specified');
      }
    }

    if (data.sku || data.barcode) {
      const existing = await this.productRepo.findBySkuOrBarcode(tenantId, data.sku || '', data.barcode || '');
      if (existing && existing.id !== id) {
        throw new Error('Another product with this SKU or Barcode already exists');
      }
    }

    await this.productRepo.update(id, tenantId, data);
    return await this.getProductById(id, tenantId);
  }

  async archiveProduct(id: string, tenantId: string) {
    await this.getProductById(id, tenantId);
    await this.productRepo.update(id, tenantId, { is_archived: true, is_active: false });
    return { message: 'Product archived successfully' };
  }

  async deleteProduct(id: string, tenantId: string) {
    await this.getProductById(id, tenantId);
    await this.productRepo.delete(id, tenantId);
    return { message: 'Product deleted successfully' };
  }

  async duplicateProduct(id: string, tenantId: string) {
    const product = await this.getProductById(id, tenantId);
    const newSku = `${product.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
    const newBarcode = `${product.barcode}-C`;

    return await this.productRepo.create({
      tenant_id: tenantId,
      category_id: product.category_id,
      supplier_id: product.supplier_id || undefined,
      name: `${product.name} (Copy)`,
      sku: newSku,
      barcode: newBarcode,
      brand: product.brand || undefined,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      wholesale_price: product.wholesale_price,
      discount_price: product.discount_price,
      tax_rate: product.tax_rate,
      unit: product.unit,
      quantity: 0,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      image_url: product.image_url || undefined,
      description: product.description || undefined,
    });
  }
}