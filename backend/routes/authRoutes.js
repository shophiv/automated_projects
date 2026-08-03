const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/session', requireAuth, authController.getSession);

module.exports = router;