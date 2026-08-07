"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
class ProductController {
    productService = new product_service_1.ProductService();
    getProducts = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const category_id = req.query.category_id;
            const search = req.query.search;
            const is_archived = req.query.is_archived === 'true' ? true : req.query.is_archived === 'false' ? false : undefined;
            const products = await this.productService.getProducts(tenantId, { category_id, search, is_archived });
            return res.status(200).json({ status: 'success', data: products });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    getProductById = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const product = await this.productService.getProductById(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: product });
        }
        catch (error) {
            return res.status(404).json({ status: 'error', code: 404, message: error.message });
        }
    };
    createProduct = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const product = await this.productService.createProduct(tenantId, req.body);
            return res.status(201).json({ status: 'success', data: product });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    updateProduct = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const product = await this.productService.updateProduct(req.params.id, tenantId, req.body);
            return res.status(200).json({ status: 'success', data: product });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    archiveProduct = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const result = await this.productService.archiveProduct(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    deleteProduct = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const result = await this.productService.deleteProduct(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    duplicateProduct = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const product = await this.productService.duplicateProduct(req.params.id, tenantId);
            return res.status(201).json({ status: 'success', data: product });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
}
exports.ProductController = ProductController;
