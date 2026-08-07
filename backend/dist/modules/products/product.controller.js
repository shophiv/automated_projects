"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
class ProductController {
    productService;
    constructor() {
        this.productService = new product_service_1.ProductService();
    }
    getProducts = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { search, category_id, limit, offset } = req.query;
            const products = await this.productService.getProducts(tenantId, search, category_id, limit ? parseInt(limit) : undefined, offset ? parseInt(offset) : undefined);
            res.status(200).json({ success: true, data: products });
        }
        catch (error) {
            next(error);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            const product = await this.productService.getProductById(tenantId, id);
            res.status(200).json({ success: true, data: product });
        }
        catch (error) {
            next(error);
        }
    };
    createProduct = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const product = await this.productService.createProduct(tenantId, req.body);
            res.status(201).json({ success: true, message: 'Product created successfully', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            const product = await this.productService.updateProduct(tenantId, id, req.body);
            res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            await this.productService.deleteProduct(tenantId, id);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
    duplicateProduct = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            const product = await this.productService.duplicateProduct(tenantId, id);
            res.status(201).json({ success: true, message: 'Product duplicated successfully', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    updatePricingConfig = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { global_margin, category_margins_json } = req.body;
            const config = await this.productService.updatePricingConfig(tenantId, global_margin, category_margins_json);
            res.status(200).json({ success: true, message: 'Pricing configuration updated successfully', data: config });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProductController = ProductController;
