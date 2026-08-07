"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
const pricing_service_1 = require("./pricing.service");
class ProductService {
    productRepo;
    pricingService;
    constructor() {
        this.productRepo = new product_repository_1.ProductRepository();
        this.pricingService = new pricing_service_1.PricingService();
    }
    async getProducts(tenantId, search, categoryId, limit, offset) {
        return await this.productRepo.findAll(tenantId, search, categoryId, limit || 50, offset || 0);
    }
    async getProductById(tenantId, id) {
        const product = await this.productRepo.findById(tenantId, id);
        if (!product) {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }
        return product;
    }
    async createProduct(tenantId, data) {
        let margin = data.profit_margin;
        if (margin === undefined || margin === null) {
            const config = await this.productRepo.getPricingConfig(tenantId);
            margin = config ? config.global_margin : 20.0;
        }
        const sellingPrice = this.pricingService.calculateSellingPrice(data.purchase_price, margin, data.tax_rate || 0);
        const productData = {
            ...data,
            categoryId: data.category_id,
            supplierId: data.supplier_id,
            purchasePrice: data.purchase_price,
            sellingPrice: data.selling_price !== undefined ? data.selling_price : sellingPrice,
            wholesalePrice: data.wholesale_price,
            discountPrice: data.discount_price,
            taxRate: data.tax_rate || 0,
            profitMargin: margin,
            minStock: data.min_stock || 0,
            maxStock: data.max_stock,
            imageUrl: data.image_url,
            activeStatus: data.active_status ?? true,
        };
        return await this.productRepo.create(tenantId, productData);
    }
    async updateProduct(tenantId, id, data) {
        const existing = await this.getProductById(tenantId, id);
        let margin = data.profit_margin !== undefined ? data.profit_margin : existing.profit_margin;
        let purchasePrice = data.purchase_price !== undefined ? data.purchase_price : existing.purchase_price;
        let taxRate = data.tax_rate !== undefined ? data.tax_rate : existing.tax_rate;
        let sellingPrice = data.selling_price;
        if (data.purchase_price !== undefined || data.profit_margin !== undefined || data.tax_rate !== undefined) {
            sellingPrice = this.pricingService.calculateSellingPrice(purchasePrice, margin, taxRate);
        }
        else if (sellingPrice === undefined) {
            sellingPrice = existing.selling_price;
        }
        const productData = {
            ...data,
            categoryId: data.category_id,
            supplierId: data.supplier_id,
            purchasePrice,
            sellingPrice,
            wholesalePrice: data.wholesale_price,
            discountPrice: data.discount_price,
            taxRate,
            profitMargin: margin,
            minStock: data.min_stock,
            maxStock: data.max_stock,
            imageUrl: data.image_url,
            activeStatus: data.active_status,
        };
        return await this.productRepo.update(tenantId, id, productData);
    }
    async deleteProduct(tenantId, id) {
        await this.getProductById(tenantId, id);
        return await this.productRepo.delete(tenantId, id);
    }
    async duplicateProduct(tenantId, id) {
        const product = await this.getProductById(tenantId, id);
        const duplicatedData = {
            ...product,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}-COPY-${Math.floor(Math.random() * 1000)}`,
            barcode: `${product.barcode}-${Math.floor(Math.random() * 1000)}`,
            category_id: product.category_id,
            supplier_id: product.supplier_id,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            profit_margin: product.profit_margin,
            tax_rate: product.tax_rate,
            unit: product.unit,
            quantity: 0,
            min_stock: product.min_stock,
            max_stock: product.max_stock,
            image_url: product.image_url,
            description: product.description,
            active_status: true,
        };
        return await this.productRepo.create(tenantId, duplicatedData);
    }
    async updatePricingConfig(tenantId, globalMargin, categoryMarginsJson) {
        return await this.productRepo.upsertPricingConfig(tenantId, globalMargin, categoryMarginsJson);
    }
}
exports.ProductService = ProductService;
