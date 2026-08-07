import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/users', authenticateJWT, authorizeRoles('Owner', 'Manager'), authController.getUsers);
router.post('/users', authenticateJWT, authorizeRoles('Owner'), authController.createUser);

export default router;