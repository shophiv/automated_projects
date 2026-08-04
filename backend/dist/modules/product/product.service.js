"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
class ProductService {
    productRepository;
    constructor() {
        this.productRepository = new product_repository_1.ProductRepository();
    }
    async getCategories(tenantId) {
        return this.productRepository.findCategoriesByTenant(tenantId);
    }
    async createCategory(tenantId, name) {
        return this.productRepository.createCategory(tenantId, name);
    }
    async updateCategory(id, tenantId, name) {
        const category = await this.productRepository.updateCategory(id, tenantId, name);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        return category;
    }
    async deleteCategory(id, tenantId) {
        const success = await this.productRepository.deleteCategory(id, tenantId);
        if (!success) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
    }
    async getProducts(tenantId, search, categoryId) {
        return this.productRepository.findProductsByTenant(tenantId, search, categoryId);
    }
    async getProductById(id, tenantId) {
        const product = await this.productRepository.findProductById(id, tenantId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    }
    async getProductByBarcode(barcode, tenantId) {
        const product = await this.productRepository.findProductByBarcode(barcode, tenantId);
        if (!product) {
            const error = new Error('Product not found with barcode');
            error.statusCode = 404;
            throw error;
        }
        return product;
    }
    async createProduct(tenantId, categoryId, name, sku, barcode, purchasePrice, sellingPrice) {
        if (categoryId) {
            const category = await this.productRepository.findCategoryById(categoryId, tenantId);
            if (!category) {
                const error = new Error('Selected category does not exist');
                error.statusCode = 400;
                throw error;
            }
        }
        try {
            return await this.productRepository.createProduct(tenantId, categoryId, name, sku, barcode, purchasePrice, sellingPrice);
        }
        catch (err) {
            if (err.code === '23505') {
                const error = new Error('Product with this SKU or barcode already exists');
                error.statusCode = 400;
                throw error;
            }
            throw err;
        }
    }
    async updateProduct(id, tenantId, categoryId, name, sku, barcode, purchasePrice, sellingPrice) {
        if (categoryId) {
            const category = await this.productRepository.findCategoryById(categoryId, tenantId);
            if (!category) {
                const error = new Error('Selected category does not exist');
                error.statusCode = 400;
                throw error;
            }
        }
        try {
            const product = await this.productRepository.updateProduct(id, tenantId, categoryId, name, sku, barcode, purchasePrice, sellingPrice);
            if (!product) {
                const error = new Error('Product not found');
                error.statusCode = 404;
                throw error;
            }
            return product;
        }
        catch (err) {
            if (err.code === '23505') {
                const error = new Error('Product with this SKU or barcode already exists');
                error.statusCode = 400;
                throw error;
            }
            throw err;
        }
    }
    async deleteProduct(id, tenantId) {
        const success = await this.productRepository.deleteProduct(id, tenantId);
        if (!success) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
    }
}
exports.ProductService = ProductService;
