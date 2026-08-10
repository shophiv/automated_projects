import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.get('/', DashboardController.getDashboard);

export const dashboardRoutes = router;