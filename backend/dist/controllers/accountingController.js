"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const zod_1 = require("zod");
const accountingService_1 = require("../services/accountingService");
const expenseSchema = zod_1.z.object({
    category: zod_1.z.enum(['Rent', 'Utilities', 'Salary', 'Transportation', 'Marketing', 'Maintenance', 'Taxes', 'Miscellaneous']),
    amount: zod_1.z.number().min(0.01, 'Amount must be greater than zero'),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
});
class AccountingController {
    static async listEntries(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = parseInt(req.query.offset || '0', 10);
            const type = req.query.type;
            const result = await accountingService_1.AccountingService.getEntries(req.user.tenantId, limit, offset, type);
            res.status(200).json({ success: true, data: result.entries, total: result.total });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async recordExpense(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = expenseSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const entry = await accountingService_1.AccountingService.recordExpense(req.user.tenantId, parsed.data);
            res.status(201).json({ success: true, data: entry });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
        }
    }
    static async getSummary(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const startDate = req.query.start_date;
            const endDate = req.query.end_date;
            const summary = await accountingService_1.AccountingService.getSummary(req.user.tenantId, startDate, endDate);
            res.status(200).json({ success: true, data: summary });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
}
exports.AccountingController = AccountingController;
