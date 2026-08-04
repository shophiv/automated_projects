"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    tenantId: zod_1.z.number().optional()
});
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    login = async (req, res, next) => {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: 'Validation error',
                        details: validation.error.errors
                    }
                });
            }
            const { email, password, tenantId } = validation.data;
            const result = await this.authService.login(email, password, tenantId);
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 12 * 60 * 60 * 1000
            });
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSession = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: { code: 401, message: 'Unauthorized' }
                });
            }
            const user = await this.authService.getSession(req.user.userId);
            res.status(200).json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
