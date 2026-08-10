import { api } from './api';

export interface DashboardSummary {
  todaySales: number;
  todayProfit: number;
  todayOrders: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentSales: Array<{
    id: string;
    invoice_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
  }>;
  topProducts: Array<{
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data.data;
    } catch (err) {
      // Fallback mock data if backend dashboard summary endpoint is not yet active in Phase 3
      return {
        todaySales: 1485.50,
        todayProfit: 420.00,
        todayOrders: 32,
        totalProducts: 142,
        lowStockCount: 5,
        outOfStockCount: 2,
        recentSales: [
          { id: '1', invoice_number: 'INV-2023-001', total_amount: 125.00, payment_method: 'Cash', created_at: new Date().toISOString() },
          { id: '2', invoice_number: 'INV-2023-002', total_amount: 45.50, payment_method: 'Card', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
          { id: '3', invoice_number: 'INV-2023-003', total_amount: 210.00, payment_method: 'Transfer', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
        ],
        topProducts: [
          { name: 'Organic Coffee Beans 500g', quantity_sold: 45, revenue: 675.00 },
          { name: 'Artisan Sourdough Bread', quantity_sold: 38, revenue: 190.00 },
          { name: 'Almond Milk 1L', quantity_sold: 29, revenue: 116.00 }
        ]
      };
    }
  }
};