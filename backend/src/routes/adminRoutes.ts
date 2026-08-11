import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { RetailerAdminController } from '../controllers/admin/retailerAdminController';
import { SubscriptionController } from '../controllers/admin/subscriptionController';
import { PlatformController } from '../controllers/admin/platformController';

const router = Router();

router.post('/auth/login', PlatformController.adminLogin);

// Protected Admin Routes
router.use(adminAuthMiddleware);

router.get('/retailers', RetailerAdminController.listRetailers);
router.put('/retailers/:id/status', RetailerAdminController.updateStatus);

router.get('/subscriptions', SubscriptionController.listSubscriptions);
router.post('/subscriptions/assign', SubscriptionController.assignSubscription);

router.get('/analytics', PlatformController.getAnalytics);
router.get('/support/logs', PlatformController.getSupportLogs);
router.post('/support/broadcast', PlatformController.broadcastAnnouncement);

export default router;