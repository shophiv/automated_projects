"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
const pricing_service_1 = require("../pricing/pricing.service");
class ProductService {
    productRepository = new product_repository_1.ProductRepository();
    pricingService = new pricing_service_1.PricingService();
    async createProduct(retailerId, data) {
        if (!data.name || !data.sku || data.purchasePrice === undefined) {
            throw new Error('Name, SKU, and purchase price are required');
        }
        // Auto-calculate selling price if profit margin provided or default
        let margin = data.profitMargin;
        if (margin === undefined) {
            const margins = await this.pricingService.getMargins(retailerId);
            margin = margins.globalMargin;
        }
        const sellingPrice = this.pricingService.calculateSellingPrice(parseFloat(data.purchasePrice), parseFloat(margin));
        const productData = {
            ...data,
            barcode: data.barcode || undefined,
            sellingPrice,
            profitMargin: margin
        };
        return await this.productRepository.create(retailerId, productData);
    }
    async getProducts(retailerId, queryParams) {
        return await this.productRepository.findAll(retailerId, queryParams);
    }
    async getProductById(productId, retailerId) {
        const product = await this.productRepository.findById(productId, retailerId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async updateProduct(productId, retailerId, data) {
        const existing = await this.productRepository.findById(productId, retailerId);
        if (!existing) {
            throw new Error('Product not found');
        }
        let purchasePrice = data.purchasePrice !== undefined ? parseFloat(data.purchasePrice) : existing.purchase_price;
        let margin = data.profitMargin !== undefined ? parseFloat(data.profitMargin) : existing.profit_margin;
        let sellingPrice = data.sellingPrice;
        if (data.purchasePrice !== undefined || data.profitMargin !== undefined) {
            sellingPrice = this.pricingService.calculateSellingPrice(purchasePrice, margin);
        }
        const updateData = {
            ...data,
            sellingPrice,
            profitMargin: margin
        };
        return await this.productRepository.update(productId, retailerId, updateData);
    }
    async archiveProduct(productId, retailerId) {
        const existing = await this.productRepository.findById(productId, retailerId);
        if (!existing) {
            throw new Error('Product not found');
        }
        return await this.productRepository.update(productId, retailerId, { status: 'archived' });
    }
    async deleteProduct(productId, retailerId) {
        const existing = await this.productRepository.findById(productId, retailerId);
        if (!existing) {
            throw new Error('Product not found');
        }
        return await this.productRepository.delete(productId, retailerId);
    }
    async duplicateProduct(productId, retailerId) {
        const existing = await this.productRepository.findById(productId, retailerId);
        if (!existing) {
            throw new Error('Product not found');
        }
        const duplicatedData = {
            categoryId: existing.category_id,
            supplierId: existing.supplier_id,
            name: `${existing.name} (Copy)`,
            sku: `${existing.sku}-COPY-${Date.now().toString().slice(-4)}`,
            barcode: existing.barcode ? `${existing.barcode}-COPY` : undefined,
            brand: existing.brand,
            purchasePrice: existing.purchase_price,
            sellingPrice: existing.selling_price,
            profitMargin: existing.profit_margin,
            taxRate: existing.tax_rate,
            unit: existing.unit,
            quantity: 0,
            minStock: existing.min_stock,
            maxStock: existing.max_stock,
            imageUrl: existing.image_url,
            description: existing.description,
            status: 'active'
        };
        return await this.productRepository.create(retailerId, duplicatedData);
    }
}
exports.ProductService = ProductService;
