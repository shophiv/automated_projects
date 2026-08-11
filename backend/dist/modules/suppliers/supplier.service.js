"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const supplier_repository_1 = require("./supplier.repository");
class SupplierService {
    supplierRepository = new supplier_repository_1.SupplierRepository();
    async createSupplier(retailerId, data) {
        if (!data.businessName) {
            throw new Error('Business name is required');
        }
        return await this.supplierRepository.create(retailerId, data);
    }
    async getSuppliers(retailerId) {
        return await this.supplierRepository.findAll(retailerId);
    }
    async updateSupplier(supplierId, retailerId, data) {
        const existing = await this.supplierRepository.findById(supplierId, retailerId);
        if (!existing) {
            throw new Error('Supplier not found');
        }
        return await this.supplierRepository.update(supplierId, retailerId, data);
    }
    async deactivateSupplier(supplierId, retailerId) {
        const existing = await this.supplierRepository.findById(supplierId, retailerId);
        if (!existing) {
            throw new Error('Supplier not found');
        }
        return await this.supplierRepository.update(supplierId, retailerId, { status: 'inactive' });
    }
    async deleteSupplier(supplierId, retailerId) {
        const existing = await this.supplierRepository.findById(supplierId, retailerId);
        if (!existing) {
            throw new Error('Supplier not found');
        }
        return await this.supplierRepository.delete(supplierId, retailerId);
    }
    async getSupplierReports(supplierId, retailerId) {
        const report = await this.supplierRepository.getReports(supplierId, retailerId);
        if (!report) {
            throw new Error('Supplier not found');
        }
        return report;
    }
}
exports.SupplierService = SupplierService;
