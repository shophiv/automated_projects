import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { UserRepository } from '../repositories/user.repository.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const userRepository = new UserRepository();
const adminController = new AdminController(userRepository);

router.get('/tenants', authenticateToken, requireAdmin, adminController.getTenants);

export default router;