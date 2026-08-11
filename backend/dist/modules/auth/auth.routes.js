"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', rateLimit_middleware_1.authLimiter, [
    (0, express_validator_1.body)('businessName').notEmpty().withMessage('Business name is required'),
    (0, express_validator_1.body)('ownerName').notEmpty().withMessage('Owner name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validation_middleware_1.validateInput
], authController.register);
router.post('/login', rateLimit_middleware_1.authLimiter, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    validation_middleware_1.validateInput
], authController.login);
router.post('/refresh-token', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validation_middleware_1.validateInput
], authController.refreshToken);
router.post('/password-reset', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    validation_middleware_1.validateInput
], authController.passwordReset);
exports.default = router;
