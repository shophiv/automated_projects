import { Router } from 'express';
import { AccountingController } from './accounting.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const accountingController = new AccountingController();

router.use(verifyToken);

router.get('/ledger', accountingController.getGeneralLedger);
router.get('/trial-balance', accountingController.getTrialBalance);
router.get('/expenses', accountingController.getExpenses);

router.post(
  '/expenses',
  requireRole(['Owner', 'Manager']),
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('amount').isNumeric().withMessage('Valid amount is required'),
    validateInput
  ],
  accountingController.recordExpense
);

export default router;