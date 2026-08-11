"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
const database_1 = require("../../config/database");
class AuthService {
    authRepository = new auth_repository_1.AuthRepository();
    async register(payload) {
        const existing = await this.authRepository.findUserByEmail(payload.email);
        if (existing) {
            throw new Error('Email already in use');
        }
        if (payload.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt_1.default.hash(payload.password, saltRounds);
        const result = await database_1.transactionManager.runInTransaction(async (client) => {
            return await this.authRepository.createRetailerAndOwner(payload.businessName, payload.ownerName, payload.email, payload.phone || '', payload.address || '', passwordHash, client);
        });
        const token = this.generateToken({
            userId: result.user.id,
            retailerId: result.user.retailer_id,
            role: result.user.role,
            email: result.user.email
        });
        const refreshToken = this.generateRefreshToken({
            userId: result.user.id
        });
        return {
            retailer: result.retailer,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role
            },
            token,
            refreshToken
        };
    }
    async login(credentials) {
        const user = await this.authRepository.findUserByEmail(credentials.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcrypt_1.default.compare(credentials.password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = this.generateToken({
            userId: user.id,
            retailerId: user.retailer_id,
            role: user.role,
            email: user.email
        });
        const refreshToken = this.generateRefreshToken({
            userId: user.id
        });
        return {
            user: {
                id: user.id,
                retailerId: user.retailer_id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessName: user.business_name
            },
            token,
            refreshToken
        };
    }
    async refreshToken(token) {
        const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const user = await this.authRepository.findUserById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const newToken = this.generateToken({
                userId: user.id,
                retailerId: user.retailer_id,
                role: user.role,
                email: user.email
            });
            return { token: newToken };
        }
        catch (err) {
            throw new Error('Invalid refresh token');
        }
    }
    async requestPasswordReset(email) {
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            // Return success even if not found for security best practice
            return { message: 'If the email exists, a password reset link has been sent.' };
        }
        // In production, send reset email. Here we issue a signed token placeholder.
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        return { message: 'Password reset link sent', resetToken };
    }
    generateToken(payload) {
        const secret = process.env.JWT_SECRET || 'default_secret';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '8h' });
    }
    generateRefreshToken(payload) {
        const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
    }
}
exports.AuthService = AuthService;
