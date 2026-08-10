import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.get('/sales', AnalyticsController.getSalesAnalytics);
router.get('/predictions', AnalyticsController.getPredictions);

export const analyticsRoutes = router;