"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeService = void 0;
const database_1 = require("../config/database");
class BarcodeService {
    static async lookupBarcode(tenantId, barcode) {
        const res = await database_1.pool.query(`SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.tenant_id = $1 AND p.barcode = $2 AND p.archived_at IS NULL`, [tenantId, barcode]);
        return res.rows[0] || null;
    }
    static generateBarcodeAsset(sku) {
        // Utility representation for barcode printing / generation asset
        return {
            sku,
            barcodeText: `*${sku}*`,
        };
    }
}
exports.BarcodeService = BarcodeService;
