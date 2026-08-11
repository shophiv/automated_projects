"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const pricing_service_1 = require("../pricing/pricing.service");
const zod_1 = require("zod");
const AppError_1 = require("../../shared/errors/AppError");
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(1),
    barcode: zod_1.z.string().optional().nullable(),
    category_id: zod_1.z.string().optional().nullable(),
    supplier_id: zod_1.z.string().optional().nullable(),
    brand: zod_1.z.string().optional().nullable(),
    purchase_price: zod_1.z.number().min(0),
    selling_price: zod_1.z.number().min(0).optional().nullable(),
    wholesale_price: zod_1.z.number().min(0).optional(),
    discount_price: zod_1.z.number().min(0).optional(),
    tax_rate: zod_1.z.number().min(0).optional(),
    profit_margin: zod_1.z.number().optional().nullable(),
    unit: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(0).optional(),
    min_stock: zod_1.z.number().min(0).optional(),
    max_stock: zod_1.z.number().min(0).optional(),
    image_url: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    active_status: zod_1.z.boolean().optional(),
});
class ProductController {
    productService = new product_service_1.ProductService();
    pricingService = new pricing_service_1.PricingService();
    getProducts = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const search = req.query.search;
            const category_id = req.query.category_id;
            const archived = req.query.archived;
            const products = await this.productService.getProducts(tenantId, { search, category_id, archived });
            return res.status(200).json({ status: 'success', data: products });
        }
        catch (error) {
            next(error);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const product = await this.productService.getProductById(tenantId, id);
            return res.status(200).json({ status: 'success', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    createProduct = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const validation = productSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const product = await this.productService.createProduct(tenantId, validation.data);
            return res.status(201).json({ status: 'success', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const validation = productSchema.partial().safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const product = await this.productService.updateProduct(tenantId, id, validation.data);
            return res.status(200).json({ status: 'success', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            await this.productService.deleteProduct(tenantId, id);
            return res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
    archiveProduct = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const product = await this.productService.archiveProduct(tenantId, id);
            return res.status(200).json({ status: 'success', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    duplicateProduct = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const product = await this.productService.duplicateProduct(tenantId, id);
            return res.status(201).json({ status: 'success', data: product });
        }
        catch (error) {
            next(error);
        }
    };
    calculatePrice = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const { purchase_price, profit_margin, tax_rate, category_id } = req.body;
            if (purchase_price === undefined || purchase_price === null) {
                throw new AppError_1.AppError('Purchase price is required', 400);
            }
            const margin = await this.pricingService.resolveProductMargin(tenantId, category_id, profit_margin);
            const selling_price = this.pricingService.calculateSellingPrice(Number(purchase_price), margin, Number(tax_rate || 0));
            return res.status(200).json({
                status: 'success',
                data: { purchase_price, profit_margin: margin, tax_rate: tax_rate || 0, selling_price },
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProductController = ProductController;
