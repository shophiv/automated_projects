"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const zod_1 = require("zod");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required')
});
const productSchema = zod_1.z.object({
    categoryId: zod_1.z.number().nullable().optional(),
    name: zod_1.z.string().min(1, 'Product name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    barcode: zod_1.z.string().nullable().optional(),
    purchasePrice: zod_1.z.number().min(0, 'Purchase price must be positive'),
    sellingPrice: zod_1.z.number().min(0, 'Selling price must be positive')
});
class ProductController {
    productService;
    constructor() {
        this.productService = new product_service_1.ProductService();
    }
    getCategories = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const categories = await this.productService.getCategories(req.user.tenantId);
            res.status(200).json({ success: true, data: { categories } });
        }
        catch (error) {
            next(error);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const validation = categorySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: 'Validation error', details: validation.error.errors }
                });
            }
            const category = await this.productService.createCategory(req.user.tenantId, validation.data.name);
            res.status(201).json({ success: true, data: { category } });
        }
        catch (error) {
            next(error);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const categoryId = parseInt(req.params.id, 10);
            const validation = categorySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: 'Validation error', details: validation.error.errors }
                });
            }
            const category = await this.productService.updateCategory(categoryId, req.user.tenantId, validation.data.name);
            res.status(200).json({ success: true, data: { category } });
        }
        catch (error) {
            next(error);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const categoryId = parseInt(req.params.id, 10);
            await this.productService.deleteCategory(categoryId, req.user.tenantId);
            res.status(200).json({ success: true, data: { message: 'Category deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    };
    getProducts = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const search = req.query.search ? String(req.query.search) : undefined;
            const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
            const products = await this.productService.getProducts(req.user.tenantId, search, categoryId);
            res.status(200).json({ success: true, data: { products } });
        }
        catch (error) {
            next(error);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const productId = parseInt(req.params.id, 10);
            const product = await this.productService.getProductById(productId, req.user.tenantId);
            res.status(200).json({ success: true, data: { product } });
        }
        catch (error) {
            next(error);
        }
    };
    getProductByBarcode = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const barcode = req.params.barcode;
            const product = await this.productService.getProductByBarcode(barcode, req.user.tenantId);
            res.status(200).json({ success: true, data: { product } });
        }
        catch (error) {
            next(error);
        }
    };
    createProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const validation = productSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: 'Validation error', details: validation.error.errors }
                });
            }
            const { categoryId, name, sku, barcode, purchasePrice, sellingPrice } = validation.data;
            const product = await this.productService.createProduct(req.user.tenantId, categoryId ?? null, name, sku, barcode ?? null, purchasePrice, sellingPrice);
            res.status(201).json({ success: true, data: { product } });
        }
        catch (error) {
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const productId = parseInt(req.params.id, 10);
            const validation = productSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: 'Validation error', details: validation.error.errors }
                });
            }
            const { categoryId, name, sku, barcode, purchasePrice, sellingPrice } = validation.data;
            const product = await this.productService.updateProduct(productId, req.user.tenantId, categoryId ?? null, name, sku, barcode ?? null, purchasePrice, sellingPrice);
            res.status(200).json({ success: true, data: { product } });
        }
        catch (error) {
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: { code: 401, message: 'Unauthorized' } });
            }
            const productId = parseInt(req.params.id, 10);
            await this.productService.deleteProduct(productId, req.user.tenantId);
            res.status(200).json({ success: true, data: { message: 'Product deleted successfully' } });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProductController = ProductController;
