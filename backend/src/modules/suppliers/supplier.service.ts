import { SupplierRepository } from './supplier.repository';

export class SupplierService {
  private supplierRepository = new SupplierRepository();

  async createSupplier(retailerId: number, data: any) {
    if (!data.businessName) {
      throw new Error('Business name is required');
    }
    return await this.supplierRepository.create(retailerId, data);
  }

  async getSuppliers(retailerId: number) {
    return await this.supplierRepository.findAll(retailerId);
  }

  async updateSupplier(supplierId: number, retailerId: number, data: any) {
    const existing = await this.supplierRepository.findById(supplierId, retailerId);
    if (!existing) {
      throw new Error('Supplier not found');
    }
    return await this.supplierRepository.update(supplierId, retailerId, data);
  }

  async deactivateSupplier(supplierId: number, retailerId: number) {
    const existing = await this.supplierRepository.findById(supplierId, retailerId);
    if (!existing) {
      throw new Error('Supplier not found');
    }
    return await this.supplierRepository.update(supplierId, retailerId, { status: 'inactive' });
  }

  async deleteSupplier(supplierId: number, retailerId: number) {
    const existing = await this.supplierRepository.findById(supplierId, retailerId);
    if (!existing) {
      throw new Error('Supplier not found');
    }
    return await this.supplierRepository.delete(supplierId, retailerId);
  }

  async getSupplierReports(supplierId: number, retailerId: number) {
    const report = await this.supplierRepository.getReports(supplierId, retailerId);
    if (!report) {
      throw new Error('Supplier not found');
    }
    return report;
  }
}