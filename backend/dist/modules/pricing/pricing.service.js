"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const connection_1 = require("../../shared/database/connection");
class PricingService {
    async getMarginSettings(retailerId) {
        let res = await (0, connection_1.query)('SELECT * FROM retailer_settings WHERE retailer_id = $1', [retailerId]);
        if (res.rows.length === 0) {
            res = await (0, connection_1.query)(`INSERT INTO retailer_settings (retailer_id, default_profit_margin) VALUES ($1, 30.00) RETURNING *`, [retailerId]);
        }
        return res.rows[0];
    }
    async updateMarginSettings(retailerId, margin) {
        const res = await (0, connection_1.query)(`INSERT INTO retailer_settings (retailer_id, default_profit_margin, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (retailer_id) 
       DO UPDATE SET default_profit_margin = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`, [retailerId, margin]);
        return res.rows[0];
    }
    calculateSellingPrice(purchasePrice, marginPercentage) {
        const price = purchasePrice * (1 + marginPercentage / 100);
        return Math.round(price * 100) / 100;
    }
}
exports.PricingService = PricingService;
