"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const authService_1 = require("../services/authService");
const registerSchema = zod_1.z.object({
    business_name: zod_1.z.string().min(2, 'Business name is required'),
    owner_name: zod_1.z.string().min(2, 'Owner name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    phone: zod_1.z.string().min(5, 'Phone number is required'),
    address: zod_1.z.string().min(5, 'Address is required'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
class AuthController {
    static async register(req, res) {
        try {
            const validationResult = registerSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.errors,
                    },
                });
                return;
            }
            const result = await authService_1.AuthService.registerRetailer(validationResult.data);
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'REGISTRATION_FAILED',
                    message: error.message || 'Failed to register retailer',
                },
            });
        }
    }
    static async login(req, res) {
        try {
            const validationResult = loginSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.errors,
                    },
                });
                return;
            }
            const result = await authService_1.AuthService.login(validationResult.data);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_FAILED',
                    message: error.message || 'Invalid credentials',
                },
            });
        }
    }
    static async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
            return;
        }
        // Stub implementation for password reset initiation
        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been dispatched.',
        });
    }
    static async resetPassword(req, res) {
        const { token, new_password } = req.body;
        if (!token || !new_password || new_password.length < 8) {
            res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid token and minimum 8-char password required' } });
            return;
        }
        // Stub implementation for completing password reset
        res.status(200).json({
            success: true,
            message: 'Password successfully reset.',
        });
    }
    static async getMe(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const profile = await authService_1.AuthService.getUserProfile(req.user.userId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: error.message || 'User profile not found',
                },
            });
        }
    }
}
exports.AuthController = AuthController;
