import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
const settingsController = new SettingsController();

router.use(verifyToken);

router.get('/', settingsController.getSettings);
router.put('/', requireRole(['Owner', 'Manager']), settingsController.updateSettings);

export default router;