"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const zod_1 = require("zod");
const inventoryService_1 = require("../services/inventoryService");
const pricingService_1 = require("../services/pricingService");
const barcodeService_1 = require("../services/barcodeService");
const adjustSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid('Valid product ID is required'),
    type: zod_1.z.enum(['stock_in', 'stock_out', 'adjustment', 'transfer']),
    quantity_change: zod_1.z.number().int('Quantity must be an integer'),
    reference: zod_1.z.string().optional(),
});
const pricingConfigSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid().optional().nullable(),
    global_profit_margin: zod_1.z.number().min(0, 'Profit margin must be positive'),
});
class InventoryController {
    static async adjustStock(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = adjustSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const result = await inventoryService_1.InventoryService.adjustStock(req.user.tenantId, req.user.userId, parsed.data.product_id, parsed.data.type, parsed.data.quantity_change, parsed.data.reference);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'ADJUST_FAILED', message: error.message } });
        }
    }
    static async getHistory(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = parseInt(req.query.offset || '0', 10);
            const history = await inventoryService_1.InventoryService.getHistory(req.user.tenantId, limit, offset);
            res.status(200).json({ success: true, data: history.logs, total: history.total });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async getAlerts(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const alerts = await inventoryService_1.InventoryService.getAlerts(req.user.tenantId);
            res.status(200).json({ success: true, data: alerts });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async lookupBarcode(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const barcode = req.query.barcode;
            if (!barcode) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Barcode is required' } });
                return;
            }
            const product = await barcodeService_1.BarcodeService.lookupBarcode(req.user.tenantId, barcode);
            if (!product) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found for barcode' } });
                return;
            }
            res.status(200).json({ success: true, data: product });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async generateBarcode(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const { sku } = req.body;
            if (!sku) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'SKU is required' } });
                return;
            }
            const asset = barcodeService_1.BarcodeService.generateBarcodeAsset(sku);
            res.status(200).json({ success: true, data: asset });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'GENERATE_FAILED', message: error.message } });
        }
    }
    static async updatePricingConfig(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = pricingConfigSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const config = await pricingService_1.PricingService.updateConfig(req.user.tenantId, parsed.data.category_id || null, parsed.data.global_profit_margin);
            res.status(200).json({ success: true, data: config });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
}
exports.InventoryController = InventoryController;
