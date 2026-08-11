import { pool } from '../../config/database';

export class PricingService {
  async configureMargins(retailerId: number, config: { globalMargin?: number; categoryMargins?: Record<number, number> }) {
    if (config.globalMargin !== undefined) {
      const query = `
        INSERT INTO retailer_settings (retailer_id, setting_key, setting_value, updated_at)
        VALUES ($1, 'global_profit_margin', $2, CURRENT_TIMESTAMP)
        ON CONFLICT (retailer_id, setting_key)
        DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
      `;
      await pool.query(query, [retailerId, config.globalMargin.toString()]);
    }

    if (config.categoryMargins) {
      for (const [catId, margin] of Object.entries(config.categoryMargins)) {
        const query = `
          INSERT INTO retailer_settings (retailer_id, setting_key, setting_value, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (retailer_id, setting_key)
          DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
        `;
        await pool.query(query, [retailerId, `category_margin_${catId}`, margin.toString()]);
      }
    }

    return { message: 'Pricing margins configured successfully' };
  }

  async getMargins(retailerId: number) {
    const query = `
      SELECT setting_key, setting_value
      FROM retailer_settings
      WHERE retailer_id = $1 AND (setting_key = 'global_profit_margin' OR setting_key LIKE 'category_margin_%')
    `;
    const result = await pool.query(query, [retailerId]);
    
    let globalMargin = 20; // default
    const categoryMargins: Record<string, number> = {};

    for (const row of result.rows) {
      if (row.setting_key === 'global_profit_margin') {
        globalMargin = parseFloat(row.setting_value);
      } else if (row.setting_key.startsWith('category_margin_')) {
        const catId = row.setting_key.replace('category_margin_', '');
        categoryMargins[catId] = parseFloat(row.setting_value);
      }
    }

    return { globalMargin, categoryMargins };
  }

  calculateSellingPrice(purchasePrice: number, margin: number): number {
    if (purchasePrice < 0 || margin < 0 || margin >= 100) {
      throw new Error('Invalid purchase price or profit margin');
    }
    // Selling Price = Purchase Price / (1 - (margin / 100))
    const sellingPrice = purchasePrice / (1 - margin / 100);
    return Math.round(sellingPrice * 100) / 100;
  }
}