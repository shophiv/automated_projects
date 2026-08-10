import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.post('/adjust', authorizeRoles('Owner', 'Manager', 'Cashier'), InventoryController.adjustStock);
router.get('/history', InventoryController.getHistory);
router.get('/alerts', InventoryController.getAlerts);
router.get('/barcode/lookup', InventoryController.lookupBarcode);
router.post('/barcode/generate', InventoryController.generateBarcode);
router.put('/pricing/config', authorizeRoles('Owner', 'Manager'), InventoryController.updatePricingConfig);

export default router;