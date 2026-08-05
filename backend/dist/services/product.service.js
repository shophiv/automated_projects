"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
class ProductService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async getProducts(tenantId) {
        return this.productRepository.findAllByTenant(tenantId);
    }
    async getProductById(id, tenantId) {
        const product = await this.productRepository.findByIdAndTenant(id, tenantId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async createProduct(tenantId, dto) {
        if (!dto.name || !dto.sku) {
            throw new Error('Product name and SKU are required');
        }
        if (dto.cost_price < 0 || dto.retail_price < 0 || dto.stock_quantity < 0) {
            throw new Error('Prices and stock quantity cannot be negative');
        }
        return this.productRepository.create(tenantId, dto);
    }
    async updateProduct(id, tenantId, dto) {
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
    async deleteProduct(id, tenantId) {
        const deleted = await this.productRepository.delete(id, tenantId);
        if (!deleted) {
            throw new Error('Product not found or unauthorized');
        }
    }
}
exports.ProductService = ProductService;
