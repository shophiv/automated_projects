"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const zod_1 = require("zod");
const productService_1 = require("../services/productService");
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    supplier_id: zod_1.z.string().uuid().optional().nullable(),
    barcode: zod_1.z.string().optional().nullable(),
    brand: zod_1.z.string().optional().nullable(),
    purchase_price: zod_1.z.number().min(0, 'Purchase price must be positive'),
    selling_price: zod_1.z.number().min(0, 'Selling price must be positive'),
    profit_margin: zod_1.z.number().optional().default(0),
    tax_rate: zod_1.z.number().optional().default(0),
    unit: zod_1.z.string().optional().default('pcs'),
    quantity: zod_1.z.number().int().min(0).optional().default(0),
    min_stock: zod_1.z.number().int().min(0).optional().default(5),
    max_stock: zod_1.z.number().int().min(0).optional().default(100),
    image_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional().nullable(),
    active_status: zod_1.z.boolean().optional().default(true),
});
class ProductController {
    static async list(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const search = req.query.search;
            const categoryId = req.query.category_id;
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = parseInt(req.query.offset || '0', 10);
            const result = await productService_1.ProductService.getProducts(req.user.tenantId, search, categoryId, limit, offset);
            res.status(200).json({ success: true, data: result.products, total: result.total });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = productSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const product = await productService_1.ProductService.createProduct(req.user.tenantId, parsed.data);
            res.status(201).json({ success: true, data: product });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
        }
    }
    static async update(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = productSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const product = await productService_1.ProductService.updateProduct(req.user.tenantId, req.params.id, parsed.data);
            res.status(200).json({ success: true, data: product });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
    static async archive(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            await productService_1.ProductService.archiveProduct(req.user.tenantId, req.params.id);
            res.status(200).json({ success: true, message: 'Product archived successfully' });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
    static async duplicate(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const product = await productService_1.ProductService.duplicateProduct(req.user.tenantId, req.params.id);
            res.status(201).json({ success: true, data: product });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
}
exports.ProductController = ProductController;
