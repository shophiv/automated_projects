"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailerAdminController = void 0;
const adminService_1 = require("../../services/adminService");
class RetailerAdminController {
    static async listRetailers(req, res) {
        try {
            const search = req.query.search;
            const status = req.query.status;
            const retailers = await adminService_1.AdminService.listRetailers(search, status);
            res.status(200).json({ success: true, data: retailers });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status || !['active', 'suspended', 'pending'].includes(status)) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid status required (active, suspended, pending)' } });
                return;
            }
            const updated = await adminService_1.AdminService.updateRetailerStatus(id, status);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
}
exports.RetailerAdminController = RetailerAdminController;
