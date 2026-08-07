"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
const category_repository_1 = require("../categories/category.repository");
class ProductService {
    productRepo = new product_repository_1.ProductRepository();
    categoryRepo = new category_repository_1.CategoryRepository();
    async getProducts(tenantId, filters) {
        return await this.productRepo.findAll(tenantId, filters);
    }
    async getProductById(id, tenantId) {
        const product = await this.productRepo.findById(id, tenantId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async createProduct(tenantId, data) {
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
    async updateProduct(id, tenantId, data) {
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
    async archiveProduct(id, tenantId) {
        await this.getProductById(id, tenantId);
        await this.productRepo.update(id, tenantId, { is_archived: true, is_active: false });
        return { message: 'Product archived successfully' };
    }
    async deleteProduct(id, tenantId) {
        await this.getProductById(id, tenantId);
        await this.productRepo.delete(id, tenantId);
        return { message: 'Product deleted successfully' };
    }
    async duplicateProduct(id, tenantId) {
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
exports.ProductService = ProductService;
