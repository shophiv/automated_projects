import { Router } from 'express';
import { PricingController } from './pricing.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const pricingController = new PricingController();

router.use(verifyToken);

router.get('/margins', pricingController.getMargins);

router.put(
  '/margins',
  requireRole(['Owner', 'Manager']),
  [
    body('globalMargin').optional().isNumeric().withMessage('Global margin must be a number'),
    validateInput
  ],
  pricingController.configureMargins
);

export default router;