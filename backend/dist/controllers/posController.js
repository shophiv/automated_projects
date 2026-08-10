"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosController = void 0;
const zod_1 = require("zod");
const posService_1 = require("../services/posService");
const checkoutSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        product_id: zod_1.z.string().uuid('Valid product ID is required'),
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
    })).min(1, 'Cart cannot be empty'),
    customer_name: zod_1.z.string().optional(),
    payment_method: zod_1.z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'split']),
    discount_amount: zod_1.z.number().min(0).optional(),
    tax_rate: zod_1.z.number().min(0).optional(),
});
class PosController {
    static async checkout(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = checkoutSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const transaction = await posService_1.PosService.checkout(req.user.tenantId, req.user.userId, parsed.data);
            res.status(201).json({ success: true, data: transaction });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CHECKOUT_FAILED', message: error.message } });
        }
    }
}
exports.PosController = PosController;
