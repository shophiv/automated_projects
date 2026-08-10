import { ProductRepository } from './product.repository';
import { PricingService } from '../pricing/pricing.service';

export class ProductService {
  private productRepo = new ProductRepository();
  private pricingService = new PricingService();

  async getProducts(retailerId: string, search?: string, categoryId?: string) {
    return await this.productRepo.findAllByRetailer(retailerId, search, categoryId);
  }

  async getProductById(id: string, retailerId: string) {
    const product = await this.productRepo.findById(id, retailerId);
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return product;
  }

  async createProduct(retailerId: string, data: any) {
    let sellingPrice = data.sellingPrice;
    if (sellingPrice === undefined || sellingPrice === null || sellingPrice === 0) {
      const settings = await this.pricingService.getMarginSettings(retailerId);
      sellingPrice = this.pricingService.calculateSellingPrice(data.purchasePrice, Number(settings.default_profit_margin));
    }

    try {
      return await this.productRepo.create({
        ...data,
        retailerId,
        sellingPrice,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const err: any = new Error('Product with this SKU already exists');
        err.statusCode = 400;
        err.code = 'DUPLICATE_SKU';
        throw err;
      }
      throw error;
    }
  }

  async updateProduct(id: string, retailerId: string, data: any) {
    const existing = await this.getProductById(id, retailerId);
    let sellingPrice = data.sellingPrice !== undefined ? data.sellingPrice : existing.selling_price;
    if (data.purchasePrice !== undefined && data.purchasePrice !== existing.purchase_price && data.sellingPrice === undefined) {
      const settings = await this.pricingService.getMarginSettings(retailerId);
      sellingPrice = this.pricingService.calculateSellingPrice(data.purchasePrice, Number(settings.default_profit_margin));
    }

    try {
      return await this.productRepo.update(id, retailerId, {
        ...existing,
        ...data,
        sellingPrice,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const err: any = new Error('Product with this SKU already exists');
        err.statusCode = 400;
        err.code = 'DUPLICATE_SKU';
        throw err;
      }
      throw error;
    }
  }

  async deleteProduct(id: string, retailerId: string) {
    await this.getProductById(id, retailerId);
    return await this.productRepo.delete(id, retailerId);
  }

  async duplicateProduct(id: string, retailerId: string) {
    const product = await this.getProductById(id, retailerId);
    const newSku = `${product.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
    const newName = `${product.name} (Copy)`;

    return await this.productRepo.create({
      retailerId,
      categoryId: product.category_id,
      supplierId: product.supplier_id,
      name: newName,
      sku: newSku,
      barcode: product.barcode ? `${product.barcode}-CPY` : undefined,
      brand: product.brand,
      purchasePrice: product.purchase_price,
      sellingPrice: product.selling_price,
      wholesalePrice: product.wholesale_price,
      discountPrice: product.discount_price,
      taxRate: product.tax_rate,
      unit: product.unit,
      quantity: 0,
      minStock: product.min_stock,
      maxStock: product.max_stock,
      imageUrl: product.image_url,
      description: product.description,
    });
  }
}