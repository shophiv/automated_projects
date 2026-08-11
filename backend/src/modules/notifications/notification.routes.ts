import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

export default router;