"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const zod_1 = require("zod");
const settingsService_1 = require("../services/settingsService");
const settingsUpdateSchema = zod_1.z.object({
    business_name: zod_1.z.string().min(2).optional(),
    owner_name: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(5).optional(),
    address: zod_1.z.string().min(5).optional(),
    settings_json: zod_1.z.object({
        currency: zod_1.z.string().optional(),
        tax_rate: zod_1.z.number().min(0).optional(),
        receipt_header: zod_1.z.string().optional(),
        receipt_footer: zod_1.z.string().optional(),
        profit_margin_default: zod_1.z.number().min(0).optional(),
    }).optional(),
});
class SettingsController {
    static async getSettings(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const settings = await settingsService_1.SettingsService.getSettings(req.user.tenantId);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async updateSettings(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = settingsUpdateSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const updated = await settingsService_1.SettingsService.updateSettings(req.user.tenantId, parsed.data);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
}
exports.SettingsController = SettingsController;
