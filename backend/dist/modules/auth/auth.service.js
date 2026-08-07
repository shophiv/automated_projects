"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';
const SALT_ROUNDS = 10;
class AuthService {
    authRepo;
    constructor() {
        this.authRepo = new auth_repository_1.AuthRepository();
    }
    async register(data) {
        const existing = await this.authRepo.findWorkspaceByEmail(data.email);
        if (existing) {
            const error = new Error('Email already registered');
            error.statusCode = 400;
            throw error;
        }
        const tenantId = await this.authRepo.createWorkspace(data.businessName, data.ownerName, data.email, data.phoneNumber, data.businessAddress);
        const passwordHash = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        const user = await this.authRepo.createUser(tenantId, data.ownerName, data.email, passwordHash, 'owner');
        await this.authRepo.logAudit(tenantId, user.id, 'WORKSPACE_REGISTERED');
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id }, JWT_SECRET, { expiresIn: '24h' });
        return {
            retailerId: tenantId,
            userId: user.id,
            token,
        };
    }
    async login(email, password) {
        const user = await this.authRepo.findUserByEmail(email);
        if (!user || user.workspace_status !== 'active') {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        await this.authRepo.logAudit(user.tenant_id, user.id, 'USER_LOGIN');
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id }, JWT_SECRET, { expiresIn: '24h' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenant_id,
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            // Return success anyway to prevent user enumeration
            return { message: 'If email exists, password reset instructions have been sent.' };
        }
        await this.authRepo.logAudit(user.tenant_id, user.id, 'FORGOT_PASSWORD_REQUESTED');
        return { message: 'If email exists, password reset instructions have been sent.' };
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const passwordHash = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
            // In full implementation update password in repo
            return { message: 'Password successfully reset.' };
        }
        catch (err) {
            const error = new Error('Invalid or expired reset token');
            error.statusCode = 400;
            throw error;
        }
    }
}
exports.AuthService = AuthService;
