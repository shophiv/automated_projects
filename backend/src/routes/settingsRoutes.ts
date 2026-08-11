import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { SettingsController } from '../controllers/settingsController';

const router = Router();

router.use(authMiddleware);

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;