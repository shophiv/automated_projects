import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(verifyToken);

router.get('/sales', analyticsController.getSalesHistory);
router.get('/sales/:id', analyticsController.getSaleById);
router.post('/sales/:id/refund', requireRole(['Owner', 'Manager']), analyticsController.processRefund);
router.post('/sales/:id/reprint', analyticsController.reprintInvoice);

router.get('/analytics/sales', analyticsController.getSalesAnalytics);
router.get('/analytics/predictions', analyticsController.getSalesPredictions);

export default router;