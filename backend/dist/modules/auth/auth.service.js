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
    async registerRetailer(data) {
        const existingRetailer = await this.authRepo.findRetailerByEmail(data.email);
        if (existingRetailer) {
            const err = new Error('Retailer with this email already exists');
            err.statusCode = 400;
            err.code = 'DUPLICATE_EMAIL';
            throw err;
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
        const defaultSubscriptionId = 'a0000000-0000-0000-0000-000000000001';
        const retailer = await this.authRepo.createRetailer({
            businessName: data.businessName,
            ownerName: data.ownerName,
            email: data.email,
            passwordHash,
            phone: data.phone,
            address: data.address,
            subscriptionId: defaultSubscriptionId,
        });
        // Automatically create Owner user for the retailer
        const user = await this.authRepo.createUser({
            retailerId: retailer.id,
            name: data.ownerName,
            email: data.email,
            passwordHash,
            role: 'Owner',
        });
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, retailerId: retailer.id, role: user.role, email: user.email }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, retailerId: retailer.id }, env_1.ENV.JWT_REFRESH_SECRET, { expiresIn: env_1.ENV.JWT_REFRESH_EXPIRES_IN });
        return {
            accessToken,
            refreshToken,
            retailer: { id: retailer.id, businessName: retailer.business_name, email: retailer.email },
            user: { id: user.id, name: user.name, role: user.role }
        };
    }
    async login(data) {
        // Check in users table first
        let user = await this.authRepo.findUserByEmail(data.email);
        let retailerId = user?.retailer_id;
        if (!user) {
            const retailer = await this.authRepo.findRetailerByEmail(data.email);
            if (retailer) {
                user = {
                    id: retailer.id,
                    retailer_id: retailer.id,
                    name: retailer.owner_name,
                    email: retailer.email,
                    password_hash: retailer.password_hash,
                    role: 'Owner'
                };
                retailerId = retailer.id;
            }
        }
        if (!user) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isMatch) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, retailerId, role: user.role, email: user.email }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, retailerId }, env_1.ENV.JWT_REFRESH_SECRET, { expiresIn: env_1.ENV.JWT_REFRESH_EXPIRES_IN });
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, role: user.role, email: user.email, retailerId }
        };
    }
    async refreshToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_REFRESH_SECRET);
            const accessToken = jsonwebtoken_1.default.sign({ userId: payload.userId, retailerId: payload.retailerId, role: payload.role || 'Owner', email: payload.email }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
            return { accessToken };
        }
        catch (error) {
            const err = new Error('Invalid refresh token');
            err.statusCode = 403;
            err.code = 'INVALID_REFRESH_TOKEN';
            throw err;
        }
    }
    async createUser(retailerId, data) {
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
        return await this.authRepo.createUser({
            retailerId,
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role || 'Cashier'
        });
    }
    async getUsers(retailerId) {
        return await this.authRepo.findUsersByRetailerId(retailerId);
    }
}
exports.AuthService = AuthService;
