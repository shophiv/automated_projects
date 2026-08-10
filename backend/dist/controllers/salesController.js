"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesController = void 0;
const salesService_1 = require("../services/salesService");
class SalesController {
    static async list(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const search = req.query.search;
            const status = req.query.status;
            const startDate = req.query.start_date;
            const endDate = req.query.end_date;
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = parseInt(req.query.offset || '0', 10);
            const result = await salesService_1.SalesService.getSales(req.user.tenantId, { search, status, startDate, endDate }, limit, offset);
            res.status(200).json({ success: true, data: result.sales, total: result.total });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async getById(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const sale = await salesService_1.SalesService.getSaleById(req.user.tenantId, req.params.id);
            res.status(200).json({ success: true, data: sale });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
    static async refund(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const refundSale = await salesService_1.SalesService.refundSale(req.user.tenantId, req.user.userId, req.params.id);
            res.status(200).json({ success: true, data: refundSale, message: 'Sale refunded and stock restored successfully' });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'REFUND_FAILED', message: error.message } });
        }
    }
}
exports.SalesController = SalesController;
