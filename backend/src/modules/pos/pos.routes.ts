import { Router } from 'express';
import { POSController } from './pos.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const posController = new POSController();

router.use(verifyToken);

router.get('/products/barcode/:barcode', posController.lookupByBarcode);

router.post(
  '/sales',
  [
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('items').isArray({ min: 1 }).withMessage('Cart must contain at least one item'),
    body('items.*.productId').isInt().withMessage('Valid product ID is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each item'),
    validateInput
  ],
  posController.processSale
);

router.post(
  '/sales/hold',
  [
    body('items').isArray({ min: 1 }).withMessage('Cart cannot be empty when holding'),
    validateInput
  ],
  posController.holdSale
);

router.get('/sales/held', posController.getHeldSales);
router.post('/sales/held/:id/resume', posController.resumeSale);
router.delete('/sales/held/:id', posController.deleteHeldSale);

export default router;