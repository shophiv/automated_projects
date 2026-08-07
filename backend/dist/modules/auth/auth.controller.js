"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(2),
    ownerName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(['Owner', 'Manager', 'Cashier'])
});
class AuthController {
    authService = new auth_service_1.AuthService();
    register = async (req, res, next) => {
        try {
            const validated = registerSchema.parse(req.body);
            const result = await this.authService.registerRetailer(validated);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validated = loginSchema.parse(req.body);
            const result = await this.authService.login(validated);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    refresh = async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' } });
            }
            const result = await this.authService.refreshToken(refreshToken);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            // Mock implementation for password reset request
            res.status(200).json({ success: true, message: 'Password reset instructions sent if email exists' });
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            // Mock implementation for password reset completion
            res.status(200).json({ success: true, message: 'Password successfully reset' });
        }
        catch (error) {
            next(error);
        }
    };
    getUsers = async (req, res, next) => {
        try {
            const retailerId = req.user.retailerId;
            const users = await this.authService.getUsers(retailerId);
            res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            next(error);
        }
    };
    createUser = async (req, res, next) => {
        try {
            const validated = createUserSchema.parse(req.body);
            const retailerId = req.user.retailerId;
            const user = await this.authService.createUser(retailerId, validated);
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
}
exports.AuthController = AuthController;
