"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const zod_1 = require("zod");
const purchaseOrderService_1 = require("../services/purchaseOrderService");
const poSchema = zod_1.z.object({
    supplier_id: zod_1.z.string().uuid('Valid supplier ID is required'),
    expected_delivery_date: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(zod_1.z.object({
        product_id: zod_1.z.string().uuid('Valid product ID is required'),
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
        unit_cost: zod_1.z.number().min(0, 'Unit cost must be positive'),
    })).min(1, 'Purchase order must have at least one item'),
});
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'submitted', 'approved', 'received', 'completed', 'cancelled']),
});
class PurchaseOrderController {
    static async list(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const orders = await purchaseOrderService_1.PurchaseOrderService.getPurchaseOrders(req.user.tenantId);
            res.status(200).json({ success: true, data: orders });
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
            const parsed = poSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const po = await purchaseOrderService_1.PurchaseOrderService.createPurchaseOrder(req.user.tenantId, parsed.data);
            res.status(201).json({ success: true, data: po });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
        }
    }
    static async updateStatus(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = statusSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const po = await purchaseOrderService_1.PurchaseOrderService.updateStatus(req.user.tenantId, req.user.userId, req.params.id, parsed.data.status);
            res.status(200).json({ success: true, data: po });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
}
exports.PurchaseOrderController = PurchaseOrderController;
