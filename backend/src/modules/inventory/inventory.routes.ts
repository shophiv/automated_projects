import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const inventoryController = new InventoryController();

router.use(verifyToken);

router.get('/history', inventoryController.getStockHistory);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/alerts', inventoryController.checkStockAlerts);

router.post(
  '/stock-in',
  requireRole(['Owner', 'Manager']),
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateInput
  ],
  inventoryController.recordStockIn
);

router.post(
  '/stock-out',
  requireRole(['Owner', 'Manager']),
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateInput
  ],
  inventoryController.recordStockOut
);

router.post(
  '/adjustment',
  requireRole(['Owner', 'Manager']),
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('newQuantity').isInt({ min: 0 }).withMessage('New quantity must be non-negative'),
    validateInput
  ],
  inventoryController.adjustStock
);

router.post(
  '/transfer',
  requireRole(['Owner', 'Manager']),
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateInput
  ],
  inventoryController.transferStock
);

export default router;