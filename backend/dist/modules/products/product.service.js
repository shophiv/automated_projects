"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../shared/errors/AppError");
const pricing_service_1 = require("../pricing/pricing.service");
class ProductService {
    pricingService = new pricing_service_1.PricingService();
    async getProducts(tenantId, query) {
        const where = { tenant_id: tenantId };
        if (query.archived === 'true') {
            where.archived = true;
        }
        else if (query.archived !== 'all') {
            where.archived = false;
        }
        if (query.category_id) {
            where.category_id = query.category_id;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { barcode: { contains: query.search, mode: 'insensitive' } },
                { brand: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return database_1.db.product.findMany({
            where,
            include: { category: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async getProductById(tenantId, id) {
        const product = await database_1.db.product.findFirst({
            where: { id, tenant_id: tenantId },
            include: { category: true },
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        return product;
    }
    async createProduct(tenantId, dto) {
        const existingSku = await database_1.db.product.findFirst({
            where: { tenant_id: tenantId, sku: dto.sku },
        });
        if (existingSku) {
            throw new AppError_1.AppError('Product with this SKU already exists', 400);
        }
        if (dto.barcode) {
            const existingBarcode = await database_1.db.product.findFirst({
                where: { tenant_id: tenantId, barcode: dto.barcode },
            });
            if (existingBarcode) {
                throw new AppError_1.AppError('Product with this barcode already exists', 400);
            }
        }
        const margin = await this.pricingService.resolveProductMargin(tenantId, dto.category_id, dto.profit_margin);
        const sellingPrice = dto.selling_price !== undefined && dto.selling_price !== null
            ? dto.selling_price
            : this.pricingService.calculateSellingPrice(dto.purchase_price, margin, dto.tax_rate || 0);
        return database_1.db.product.create({
            data: {
                tenant_id: tenantId,
                category_id: dto.category_id || null,
                supplier_id: dto.supplier_id || null,
                name: dto.name,
                sku: dto.sku,
                barcode: dto.barcode || null,
                brand: dto.brand || null,
                purchase_price: dto.purchase_price,
                selling_price: sellingPrice,
                wholesale_price: dto.wholesale_price || 0,
                discount_price: dto.discount_price || 0,
                tax_rate: dto.tax_rate || 0,
                profit_margin: margin,
                unit: dto.unit || 'pcs',
                quantity: dto.quantity || 0,
                min_stock: dto.min_stock ?? 5,
                max_stock: dto.max_stock ?? 100,
                image_url: dto.image_url || null,
                description: dto.description || null,
                active_status: dto.active_status ?? true,
            },
            include: { category: true },
        });
    }
    async updateProduct(tenantId, id, dto) {
        const product = await database_1.db.product.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        if (dto.sku && dto.sku !== product.sku) {
            const existingSku = await database_1.db.product.findFirst({
                where: { tenant_id: tenantId, sku: dto.sku },
            });
            if (existingSku) {
                throw new AppError_1.AppError('SKU already in use', 400);
            }
        }
        if (dto.barcode && dto.barcode !== product.barcode) {
            const existingBarcode = await database_1.db.product.findFirst({
                where: { tenant_id: tenantId, barcode: dto.barcode },
            });
            if (existingBarcode) {
                throw new AppError_1.AppError('Barcode already in use', 400);
            }
        }
        const purchasePrice = dto.purchase_price !== undefined ? dto.purchase_price : product.purchase_price;
        const taxRate = dto.tax_rate !== undefined ? dto.tax_rate : product.tax_rate;
        const categoryId = dto.category_id !== undefined ? dto.category_id : product.category_id;
        const marginInput = dto.profit_margin !== undefined ? dto.profit_margin : product.profit_margin;
        const margin = await this.pricingService.resolveProductMargin(tenantId, categoryId, marginInput);
        let sellingPrice = product.selling_price;
        if (dto.selling_price !== undefined) {
            sellingPrice = dto.selling_price;
        }
        else if (dto.purchase_price !== undefined || dto.profit_margin !== undefined || dto.tax_rate !== undefined) {
            sellingPrice = this.pricingService.calculateSellingPrice(purchasePrice, margin, taxRate);
        }
        return database_1.db.product.update({
            where: { id },
            data: {
                ...(dto.category_id !== undefined && { category_id: dto.category_id }),
                ...(dto.supplier_id !== undefined && { supplier_id: dto.supplier_id }),
                ...(dto.name && { name: dto.name }),
                ...(dto.sku && { sku: dto.sku }),
                ...(dto.barcode !== undefined && { barcode: dto.barcode }),
                ...(dto.brand !== undefined && { brand: dto.brand }),
                ...(dto.purchase_price !== undefined && { purchase_price: dto.purchase_price }),
                selling_price: sellingPrice,
                ...(dto.wholesale_price !== undefined && { wholesale_price: dto.wholesale_price }),
                ...(dto.discount_price !== undefined && { discount_price: dto.discount_price }),
                ...(dto.tax_rate !== undefined && { tax_rate: dto.tax_rate }),
                profit_margin: margin,
                ...(dto.unit && { unit: dto.unit }),
                ...(dto.quantity !== undefined && { quantity: dto.quantity }),
                ...(dto.min_stock !== undefined && { min_stock: dto.min_stock }),
                ...(dto.max_stock !== undefined && { max_stock: dto.max_stock }),
                ...(dto.image_url !== undefined && { image_url: dto.image_url }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.active_status !== undefined && { active_status: dto.active_status }),
            },
            include: { category: true },
        });
    }
    async deleteProduct(tenantId, id) {
        const product = await database_1.db.product.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        await database_1.db.product.delete({ where: { id } });
    }
    async archiveProduct(tenantId, id) {
        const product = await database_1.db.product.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        return database_1.db.product.update({
            where: { id },
            data: { archived: !product.archived },
            include: { category: true },
        });
    }
    async duplicateProduct(tenantId, id) {
        const product = await database_1.db.product.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        const newSku = `${product.sku}-COPY-${Date.now().toString().slice(-4)}`;
        const newBarcode = product.barcode ? `${product.barcode}-DUP` : null;
        return database_1.db.product.create({
            data: {
                tenant_id: tenantId,
                category_id: product.category_id,
                supplier_id: product.supplier_id,
                name: `${product.name} (Copy)`,
                sku: newSku,
                barcode: newBarcode,
                brand: product.brand,
                purchase_price: product.purchase_price,
                selling_price: product.selling_price,
                wholesale_price: product.wholesale_price,
                discount_price: product.discount_price,
                tax_rate: product.tax_rate,
                profit_margin: product.profit_margin,
                unit: product.unit,
                quantity: 0,
                min_stock: product.min_stock,
                max_stock: product.max_stock,
                image_url: product.image_url,
                description: product.description,
                active_status: product.active_status,
            },
            include: { category: true },
        });
    }
}
exports.ProductService = ProductService;
