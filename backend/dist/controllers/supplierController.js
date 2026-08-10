"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const zod_1 = require("zod");
const supplierService_1 = require("../services/supplierService");
const supplierSchema = zod_1.z.object({
    business_name: zod_1.z.string().min(2, 'Business name is required'),
    contact_person: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email('Invalid email format').optional().nullable().or(zod_1.z.literal('')),
    address: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
class SupplierController {
    static async list(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const suppliers = await supplierService_1.SupplierService.getSuppliers(req.user.tenantId);
            res.status(200).json({ success: true, data: suppliers });
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
            const parsed = supplierSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const supplier = await supplierService_1.SupplierService.createSupplier(req.user.tenantId, parsed.data);
            res.status(201).json({ success: true, data: supplier });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
        }
    }
    static async update(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = supplierSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const supplier = await supplierService_1.SupplierService.updateSupplier(req.user.tenantId, req.params.id, parsed.data);
            res.status(200).json({ success: true, data: supplier });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
    static async delete(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            await supplierService_1.SupplierService.deleteSupplier(req.user.tenantId, req.params.id);
            res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
    static async report(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const report = await supplierService_1.SupplierService.getSupplierReport(req.user.tenantId, req.params.id);
            res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
}
exports.SupplierController = SupplierController;
