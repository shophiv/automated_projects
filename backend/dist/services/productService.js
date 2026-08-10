"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const productRepository_1 = require("../repositories/productRepository");
class ProductService {
    static async createProduct(tenantId, data) {
        return productRepository_1.ProductRepository.create(tenantId, data);
    }
    static async getProducts(tenantId, search, categoryId, limit = 50, offset = 0) {
        return productRepository_1.ProductRepository.findPaginated(tenantId, search, categoryId, limit, offset);
    }
    static async getProductById(tenantId, id) {
        const product = await productRepository_1.ProductRepository.findById(tenantId, id);
        if (!product) {
            throw new Error('Product not found.');
        }
        return product;
    }
    static async updateProduct(tenantId, id, data) {
        const product = await productRepository_1.ProductRepository.update(tenantId, id, data);
        if (!product) {
            throw new Error('Product not found.');
        }
        return product;
    }
    static async archiveProduct(tenantId, id) {
        const success = await productRepository_1.ProductRepository.archive(tenantId, id);
        if (!success) {
            throw new Error('Product not found.');
        }
    }
    static async duplicateProduct(tenantId, id) {
        const product = await productRepository_1.ProductRepository.duplicate(tenantId, id);
        if (!product) {
            throw new Error('Product not found.');
        }
        return product;
    }
}
exports.ProductService = ProductService;
