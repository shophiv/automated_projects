"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const database_1 = require("../config/database");
class PricingService {
    static async calculateSellingPrice(tenantId, categoryId, purchasePrice, customMargin) {
        let margin = customMargin;
        if (margin === undefined || margin === null) {
            if (categoryId) {
                const catRes = await database_1.pool.query('SELECT global_profit_margin FROM pricing_configs WHERE tenant_id = $1 AND category_id = $2', [tenantId, categoryId]);
                if (catRes.rows.length > 0) {
                    margin = parseFloat(catRes.rows[0].global_profit_margin);
                }
            }
            if (margin === undefined || margin === null) {
                const tenantRes = await database_1.pool.query('SELECT global_profit_margin FROM pricing_configs WHERE tenant_id = $1 AND category_id IS NULL', [tenantId]);
                if (tenantRes.rows.length > 0) {
                    margin = parseFloat(tenantRes.rows[0].global_profit_margin);
                }
                else {
                    margin = 20.00; // default 20%
                }
            }
        }
        const sellingPrice = purchasePrice * (1 + margin / 100);
        return {
            sellingPrice: parseFloat(sellingPrice.toFixed(2)),
            profitMargin: margin,
        };
    }
    static async updateConfig(tenantId, categoryId, globalProfitMargin) {
        const existing = await database_1.pool.query('SELECT id FROM pricing_configs WHERE tenant_id = $1 AND (category_id = $2 OR ($2 IS NULL AND category_id IS NULL))', [tenantId, categoryId || null]);
        if (existing.rows.length > 0) {
            const res = await database_1.pool.query(`UPDATE pricing_configs 
         SET global_profit_margin = $1, updated_at = NOW() 
         WHERE tenant_id = $2 AND (category_id = $3 OR ($3 IS NULL AND category_id IS NULL))
         RETURNING *`, [globalProfitMargin, tenantId, categoryId || null]);
            return res.rows[0];
        }
        else {
            const res = await database_1.pool.query(`INSERT INTO pricing_configs (tenant_id, category_id, global_profit_margin)
         VALUES ($1, $2, $3)
         RETURNING *`, [tenantId, categoryId || null, globalProfitMargin]);
            return res.rows[0];
        }
    }
}
exports.PricingService = PricingService;
