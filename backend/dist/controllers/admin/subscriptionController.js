"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const adminService_1 = require("../../services/adminService");
class SubscriptionController {
    static async listSubscriptions(req, res) {
        try {
            const plans = await adminService_1.AdminService.listSubscriptions();
            res.status(200).json({ success: true, data: plans });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async assignSubscription(req, res) {
        try {
            const { tenant_id, subscription_id } = req.body;
            if (!tenant_id || !subscription_id) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'tenant_id and subscription_id are required' } });
                return;
            }
            const updated = await adminService_1.AdminService.assignSubscription(tenant_id, subscription_id);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'ASSIGN_FAILED', message: error.message } });
        }
    }
}
exports.SubscriptionController = SubscriptionController;
