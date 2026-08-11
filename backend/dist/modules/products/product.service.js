"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
class ProductService {
    productRepository = new product_repository_1.ProductRepository();
    async createProduct(retailerId, data) {
        if (!data.name || !data.sku) {
            throw new Error('Product name and SKU are required');
        }
        return await this.productRepository.create(retailerId, data);
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
        return await this.productRepository.update(productId, retailerId, data);
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
        return await this.productRepository.duplicate(productId, retailerId);
    }
}
exports.ProductService = ProductService;
