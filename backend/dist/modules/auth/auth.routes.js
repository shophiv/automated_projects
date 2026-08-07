"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2, 'Business name is required'),
        ownerName: zod_1.z.string().min(2, 'Owner name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().min(6, 'Valid phone number required'),
        address: zod_1.z.string().min(5, 'Address is required'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
router.post('/register', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(registerSchema), controller.register);
router.post('/login', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(loginSchema), controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/me', auth_middleware_1.authenticateJWT, controller.getMe);
exports.default = router;
