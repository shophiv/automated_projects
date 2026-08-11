"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const zod_1 = require("zod");
const AppError_1 = require("../../shared/errors/AppError");
const registerSchema = zod_1.z.object({
    business_name: zod_1.z.string().min(2),
    owner_name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    phone: zod_1.z.string().min(5),
    address: zod_1.z.string().min(5),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string().min(1),
    new_password: zod_1.z.string().min(8),
});
class AuthController {
    authService = new auth_service_1.AuthService();
    register = async (req, res, next) => {
        try {
            const validation = registerSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const result = await this.authService.registerTenant(validation.data);
            return res.status(201).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const result = await this.authService.login(validation.data);
            return res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) {
                throw new AppError_1.AppError('Email is required', 400);
            }
            await this.authService.forgotPassword(email);
            return res.status(200).json({
                status: 'success',
                message: 'If the email exists, a password reset link has been sent.',
            });
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const validation = resetPasswordSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            await this.authService.resetPassword(validation.data);
            return res.status(200).json({
                status: 'success',
                message: 'Password successfully reset.',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
