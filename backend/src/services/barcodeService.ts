import { pool } from '../config/database';

export class BarcodeService {
  static async lookupBarcode(tenantId: string, barcode: string): Promise<any | null> {
    const res = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.tenant_id = $1 AND p.barcode = $2 AND p.archived_at IS NULL`,
      [tenantId, barcode]
    );
    return res.rows[0] || null;
  }

  static generateBarcodeAsset(sku: string): { sku: string; barcodeText: string } {
    // Utility representation for barcode printing / generation asset
    return {
      sku,
      barcodeText: `*${sku}*`,
    };
  }
}