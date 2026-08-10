import { query } from '../../shared/database/connection';

export class PricingService {
  async getMarginSettings(retailerId: string) {
    let res = await query('SELECT * FROM retailer_settings WHERE retailer_id = $1', [retailerId]);
    if (res.rows.length === 0) {
      res = await query(
        `INSERT INTO retailer_settings (retailer_id, default_profit_margin) VALUES ($1, 30.00) RETURNING *`,
        [retailerId]
      );
    }
    return res.rows[0];
  }

  async updateMarginSettings(retailerId: string, margin: number) {
    const res = await query(
      `INSERT INTO retailer_settings (retailer_id, default_profit_margin, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (retailer_id) 
       DO UPDATE SET default_profit_margin = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [retailerId, margin]
    );
    return res.rows[0];
  }

  calculateSellingPrice(purchasePrice: number, marginPercentage: number): number {
    const price = purchasePrice * (1 + marginPercentage / 100);
    return Math.round(price * 100) / 100;
  }
}