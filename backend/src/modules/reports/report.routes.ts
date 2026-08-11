import { Router } from 'express';
import { ReportController } from './report.controller';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();
const reportController = new ReportController();

router.use(verifyToken);

router.get('/export', reportController.generateReport);

export default router;