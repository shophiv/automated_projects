import { Router } from 'express';
import { InventoryController } from './inventoryController';
import { authenticateToken } from '../auth/authMiddleware';
import { tenantContextMiddleware } from '../../middleware/tenant';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticateToken);
router.use(tenantContextMiddleware);

router.get('/', inventoryController.getInventory);
router.put('/:productId', inventoryController.updateInventory);

export default router;