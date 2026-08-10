import { SupplierRepository, SupplierData } from '../repositories/supplierRepository';

export class SupplierService {
  static async createSupplier(tenantId: string, data: Omit<SupplierData, 'tenant_id'>): Promise<any> {
    const cleanData: SupplierData = {
      tenant_id: tenantId,
      business_name: data.business_name,
      contact_person: data.contact_person ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
    };
    return await SupplierRepository.create(cleanData);
  }

  static async getSuppliers(tenantId: string): Promise<any[]> {
    return await SupplierRepository.findByTenant(tenantId);
  }

  static async updateSupplier(tenantId: string, id: string, data: Partial<SupplierData>): Promise<any> {
    const cleanData: Partial<SupplierData> = {
      business_name: data.business_name,
      contact_person: data.contact_person !== undefined ? (data.contact_person ?? null) : undefined,
      phone: data.phone !== undefined ? (data.phone ?? null) : undefined,
      email: data.email !== undefined ? (data.email ?? null) : undefined,
      address: data.address !== undefined ? (data.address ?? null) : undefined,
      notes: data.notes !== undefined ? (data.notes ?? null) : undefined,
    };
    const supplier = await SupplierRepository.update(tenantId, id, cleanData);
    if (!supplier) throw new Error('Supplier not found');
    return supplier;
  }

  static async deleteSupplier(tenantId: string, id: string): Promise<void> {
    const success = await SupplierRepository.delete(tenantId, id);
    if (!success) throw new Error('Supplier not found');
  }

  static async getSupplierReport(tenantId: string, supplierId: string): Promise<any> {
    return await SupplierRepository.getSupplierReport(tenantId, supplierId);
  }
}