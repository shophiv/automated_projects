import { Router } from 'express';
import { PurchaseOrderController } from './po.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const poController = new PurchaseOrderController();

router.use(verifyToken);

router.get('/', poController.getPurchaseOrders);
router.get('/:id', poController.getPurchaseOrderById);

router.post(
  '/',
  requireRole(['Owner', 'Manager']),
  [
    body('supplierId').isInt().withMessage('Valid supplier ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').isInt().withMessage('Valid product ID required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitCost').isNumeric().withMessage('Unit cost must be a number'),
    validateInput
  ],
  poController.createPurchaseOrder
);

router.put(
  '/:id/status',
  requireRole(['Owner', 'Manager']),
  [
    body('status').notEmpty().withMessage('Status is required'),
    validateInput
  ],
  poController.updatePOStatus
);

export default router;