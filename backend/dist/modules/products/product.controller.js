"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const pricing_service_1 = require("../pricing/pricing.service");
const zod_1 = require("zod");
const productSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional().nullable(),
    supplierId: zod_1.z.string().uuid().optional().nullable(),
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(1),
    barcode: zod_1.z.string().optional().nullable(),
    brand: zod_1.z.string().optional().nullable(),
    purchasePrice: zod_1.z.number().min(0),
    sellingPrice: zod_1.z.number().min(0).optional(),
    wholesalePrice: zod_1.z.number().min(0).optional(),
    discountPrice: zod_1.z.number().min(0).optional(),
    taxRate: zod_1.z.number().min(0).optional(),
    unit: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().min(0),
    minStock: zod_1.z.number().int().min(0).optional(),
    maxStock: zod_1.z.number().int().min(0).optional(),
    imageUrl: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    active: zod_1.z.boolean().optional(),
});
const marginSchema = zod_1.z.object({
    margin: zod_1.z.number().min(0).max(1000),
});
class ProductController {
    productService = new product_service_1.ProductService();
    pricingService = new pricing_service_1.PricingService();
    getProducts = async (req, res, next) => {
        try {
            const search = req.query.search;
            const categoryId = req.query.categoryId;
            const products = await this.productService.getProducts(req.user.retailerId, search, categoryId);
            res.status(200).json({ success: true, data: products });
        }
        catch (error) {
            next(error);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            const product = await this.productService.getProductById(req.params.id, req.user.retailerId);
            res.status(200).json({ success: true, data: product });
        }
        catch (error) {
            next(error);
        }
    };
    createProduct = async (req, res, next) => {
        try {
            const validated = productSchema.parse(req.body);
            const product = await this.productService.createProduct(req.user.retailerId, validated);
            res.status(201).json({ success: true, data: product });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            const validated = productSchema.partial().parse(req.body);
            const product = await this.productService.updateProduct(req.params.id, req.user.retailerId, validated);
            res.status(200).json({ success: true, data: product });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            await this.productService.deleteProduct(req.params.id, req.user.retailerId);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
    duplicateProduct = async (req, res, next) => {
        try {
            const product = await this.productService.duplicateProduct(req.params.id, req.user.retailerId);
            res.status(201).json({ success: true, data: product });
        }
        catch (error) {
            next(error);
        }
    };
    updateMargins = async (req, res, next) => {
        try {
            const validated = marginSchema.parse(req.body);
            const settings = await this.pricingService.updateMarginSettings(req.user.retailerId, validated.margin);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    getMargins = async (req, res, next) => {
        try {
            const settings = await this.pricingService.getMarginSettings(req.user.retailerId);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProductController = ProductController;
