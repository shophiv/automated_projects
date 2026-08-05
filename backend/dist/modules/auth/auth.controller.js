"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const registerSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(1, 'Tenant name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
class AuthController {
    authService = new auth_service_1.AuthService();
    register = async (req, res) => {
        try {
            const validationResult = registerSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.format(),
                    },
                });
                return;
            }
            const result = await this.authService.register(validationResult.data);
            res.status(201).json({ data: result });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'SERVER_ERROR',
                    message: error.message || 'Internal server error',
                },
            });
        }
    };
    login = async (req, res) => {
        try {
            const validationResult = loginSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.format(),
                    },
                });
                return;
            }
            const result = await this.authService.login(validationResult.data);
            res.status(200).json({ data: result });
        }
        catch (error) {
            const status = error.message === 'Invalid email or password' ? 401 : 500;
            res.status(status).json({
                error: {
                    code: status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR',
                    message: error.message || 'Internal server error',
                },
            });
        }
    };
}
exports.AuthController = AuthController;
