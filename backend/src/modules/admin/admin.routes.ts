import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AdminController();

router.use(authenticate, authorize(['ADMIN']));

router.get('/retailers', controller.getRetailers);
router.get('/retailers/:id', controller.getRetailerById);
router.post('/retailers/:id/approve', controller.approveRetailer);
router.patch('/retailers/:id/status', controller.updateRetailerStatus);
router.delete('/retailers/:id', controller.deleteRetailer);

export const adminRoutes = router;