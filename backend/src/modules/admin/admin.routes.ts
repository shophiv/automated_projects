import { Router } from 'express';
import { AdminController } from './admin.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and Admin role (or Owner acting as super admin)
router.use(verifyToken);
router.use(requireRole(['Admin', 'Owner']));

router.get('/retailers', adminController.getRetailersList);
router.put('/retailers/:id/status', adminController.updateRetailerStatus);
router.delete('/retailers/:id', adminController.deleteRetailer);
router.post('/retailers/:id/reset-password', adminController.resetRetailerPassword);

router.get('/subscriptions', adminController.getSubscriptions);
router.put('/subscriptions/:id', adminController.updateSubscriptionPlan);

router.get('/analytics', adminController.getPlatformAnalytics);

router.get('/support/logs', adminController.getSupportLogs);
router.post('/support/broadcast', adminController.broadcastAnnouncement);

export default router;