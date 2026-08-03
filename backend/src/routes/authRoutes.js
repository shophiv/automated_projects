const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const { validateAuth } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/register', validateAuth, authController.register);
router.post('/login', validateAuth, authController.login);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;