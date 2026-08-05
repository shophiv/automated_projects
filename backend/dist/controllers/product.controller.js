"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const validation_js_1 = require("../utils/validation.js");
class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    getProducts = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            if (!tenantId) {
                res.status(403).json({ error: 'Tenant context required' });
                return;
            }
            const products = await this.productService.getProducts(tenantId);
            res.status(200).json({ products });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to retrieve products' });
        }
    };
    getProductById = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const productId = parseInt(req.params.id, 10);
            if (!tenantId) {
                res.status(403).json({ error: 'Tenant context required' });
                return;
            }
            if (isNaN(productId)) {
                res.status(400).json({ error: 'Invalid product ID' });
                return;
            }
            const product = await this.productService.getProductById(productId, tenantId);
            res.status(200).json({ product });
        }
        catch (error) {
            const status = error.message === 'Product not found' ? 404 : 500;
            res.status(status).json({ error: error.message || 'Failed to retrieve product' });
        }
    };
    createProduct = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            if (!tenantId) {
                res.status(403).json({ error: 'Tenant context required' });
                return;
            }
            const missing = (0, validation_js_1.validateRequiredFields)(['name', 'sku', 'cost_price', 'retail_price', 'stock_quantity'], req.body);
            if (missing.length > 0) {
                res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
                return;
            }
            const product = await this.productService.createProduct(tenantId, req.body);
            res.status(201).json({ product });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Failed to create product' });
        }
    };
    updateProduct = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const productId = parseInt(req.params.id, 10);
            if (!tenantId) {
                res.status(403).json({ error: 'Tenant context required' });
                return;
            }
            if (isNaN(productId)) {
                res.status(400).json({ error: 'Invalid product ID' });
                return;
            }
            const product = await this.productService.updateProduct(productId, tenantId, req.body);
            res.status(200).json({ product });
        }
        catch (error) {
            const status = error.message === 'Product not found or unauthorized' ? 404 : 400;
            res.status(status).json({ error: error.message || 'Failed to update product' });
        }
    };
    deleteProduct = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const productId = parseInt(req.params.id, 10);
            if (!tenantId) {
                res.status(403).json({ error: 'Tenant context required' });
                return;
            }
            if (isNaN(productId)) {
                res.status(400).json({ error: 'Invalid product ID' });
                return;
            }
            await this.productService.deleteProduct(productId, tenantId);
            res.status(200).json({ message: 'Product deleted successfully' });
        }
        catch (error) {
            const status = error.message === 'Product not found or unauthorized' ? 404 : 500;
            res.status(status).json({ error: error.message || 'Failed to delete product' });
        }
    };
}
exports.ProductController = ProductController;
