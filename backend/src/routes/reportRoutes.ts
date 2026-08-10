import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.get('/export', ReportController.exportReport);

export const reportRoutes = router;