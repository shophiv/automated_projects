"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const transaction_1 = require("../utils/transaction");
const auditService_1 = require("./auditService");
class AuthService {
    static async registerRetailer(data) {
        return (0, transaction_1.withTransaction)(async (client) => {
            // Check existing email
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [data.email]);
            if (existingUser.rows.length > 0) {
                throw new Error('Email is already registered.');
            }
            // Create Tenant
            const tenantResult = await client.query(`INSERT INTO tenants (business_name, owner_name, email, phone, address, status)
         VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`, [data.business_name, data.owner_name, data.email, data.phone, data.address]);
            const tenant = tenantResult.rows[0];
            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
            // Create Owner User
            const userResult = await client.query(`INSERT INTO users (tenant_id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'Owner') RETURNING id, tenant_id, name, email, role, created_at`, [tenant.id, data.owner_name, data.email, passwordHash]);
            const user = userResult.rows[0];
            await auditService_1.AuditService.logAction(tenant.id, user.id, 'TENANT_REGISTERED', {
                business_name: tenant.business_name,
            });
            const tokenPayload = {
                userId: user.id,
                tenantId: tenant.id,
                role: user.role,
                email: user.email,
            };
            const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
            const token = jsonwebtoken_1.default.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
            return { tenant, user, token };
        });
    }
    static async login(data) {
        const userResult = await database_1.pool.query(`SELECT u.*, t.status as tenant_status FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1`, [data.email]);
        if (userResult.rows.length === 0) {
            throw new Error('Invalid email or password.');
        }
        const user = userResult.rows[0];
        if (user.tenant_status !== 'active') {
            throw new Error('Tenant account is suspended or inactive.');
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            await auditService_1.AuditService.logAction(user.tenant_id, user.id, 'LOGIN_FAILED', { reason: 'Incorrect password' });
            throw new Error('Invalid email or password.');
        }
        await auditService_1.AuditService.logAction(user.tenant_id, user.id, 'LOGIN_SUCCESS', {});
        const tokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            email: user.email,
        };
        const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
        const token = jsonwebtoken_1.default.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
        return {
            user: {
                id: user.id,
                tenantId: user.tenant_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
    static async getUserProfile(userId) {
        const result = await database_1.pool.query(`SELECT u.id, u.tenant_id, u.name, u.email, u.role, u.created_at,
              t.business_name, t.status as tenant_status
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`, [userId]);
        if (result.rows.length === 0) {
            throw new Error('User not found.');
        }
        return result.rows[0];
    }
}
exports.AuthService = AuthService;
