import { Router } from 'express';
import { AccountingController } from '../controllers/accountingController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.get('/entries', AccountingController.listEntries);
router.post('/expenses', AccountingController.recordExpense);
router.get('/summary', AccountingController.getSummary);

export const accountingRoutes = router;