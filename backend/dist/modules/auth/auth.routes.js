"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
const registerSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(1, 'Business name is required'),
    ownerName: zod_1.z.string().min(1, 'Owner name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    phoneNumber: zod_1.z.string().min(1, 'Phone number is required'),
    businessAddress: zod_1.z.string().min(1, 'Business address is required'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional(),
});
const forgotSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
const resetSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
router.post('/register', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(registerSchema), controller.register);
router.post('/login', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(loginSchema), controller.login);
router.post('/forgot-password', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(forgotSchema), controller.forgotPassword);
router.post('/reset-password', rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(resetSchema), controller.resetPassword);
exports.default = router;
