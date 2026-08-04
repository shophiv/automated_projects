"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    async login(email, password, tenantId) {
        let user = null;
        if (tenantId) {
            user = await this.authRepository.findUserByEmailAndTenant(email, tenantId);
        }
        else {
            user = await this.authRepository.findUserByEmail(email);
        }
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role
        }, secret, { expiresIn: '12h' });
        const { password_hash, ...userProfile } = user;
        return { token, user: userProfile };
    }
    async getSession(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const { password_hash, ...userProfile } = user;
        return userProfile;
    }
}
exports.AuthService = AuthService;
