"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const supplierRepository_1 = require("../repositories/supplierRepository");
class SupplierService {
    static async createSupplier(tenantId, data) {
        const cleanData = {
            tenant_id: tenantId,
            business_name: data.business_name,
            contact_person: data.contact_person ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            address: data.address ?? null,
            notes: data.notes ?? null,
        };
        return await supplierRepository_1.SupplierRepository.create(cleanData);
    }
    static async getSuppliers(tenantId) {
        return await supplierRepository_1.SupplierRepository.findByTenant(tenantId);
    }
    static async updateSupplier(tenantId, id, data) {
        const cleanData = {
            business_name: data.business_name,
            contact_person: data.contact_person !== undefined ? (data.contact_person ?? null) : undefined,
            phone: data.phone !== undefined ? (data.phone ?? null) : undefined,
            email: data.email !== undefined ? (data.email ?? null) : undefined,
            address: data.address !== undefined ? (data.address ?? null) : undefined,
            notes: data.notes !== undefined ? (data.notes ?? null) : undefined,
        };
        const supplier = await supplierRepository_1.SupplierRepository.update(tenantId, id, cleanData);
        if (!supplier)
            throw new Error('Supplier not found');
        return supplier;
    }
    static async deleteSupplier(tenantId, id) {
        const success = await supplierRepository_1.SupplierRepository.delete(tenantId, id);
        if (!success)
            throw new Error('Supplier not found');
    }
    static async getSupplierReport(tenantId, supplierId) {
        return await supplierRepository_1.SupplierRepository.getSupplierReport(tenantId, supplierId);
    }
}
exports.SupplierService = SupplierService;
