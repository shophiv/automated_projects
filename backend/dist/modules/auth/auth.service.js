"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
const env_1 = require("../../config/env");
class AuthService {
    authRepo = new auth_repository_1.AuthRepository();
    async register(data) {
        const existingUser = await this.authRepo.findUserByEmail(data.email);
        if (existingUser) {
            throw new Error('Email is already registered');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
        const result = await this.authRepo.createTenantAndOwner({
            businessName: data.businessName,
            ownerName: data.ownerName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            passwordHash,
        });
        const token = jsonwebtoken_1.default.sign({
            id: result.user.id,
            tenant_id: result.tenant.id,
            email: result.user.email,
            role: result.user.role,
        }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
        return { token, user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }, tenant: result.tenant };
    }
    async login(data) {
        const user = await this.authRepo.findUserByEmail(data.email);
        if (!user || !user.is_active) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        await this.authRepo.updateLastLogin(user.id);
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            tenant_id: user.tenant_id,
            email: user.email,
            role: user.role,
        }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id } };
    }
    async getMe(userId) {
        const user = await this.authRepo.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id };
    }
}
exports.AuthService = AuthService;
