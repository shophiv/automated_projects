import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.get('/session', authenticate, authController.getSession);

export default router;