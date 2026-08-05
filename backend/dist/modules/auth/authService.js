"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_retail_key';
const SALT_ROUNDS = 10;
class AuthService {
    async register(dto) {
        const client = await (0, database_1.query)('BEGIN');
        try {
            // Check if user already exists
            const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [dto.email]);
            if (existingUser.rows.length > 0) {
                throw new Error('User with this email already exists.');
            }
            // Create tenant
            const tenantResult = await (0, database_1.query)('INSERT INTO tenants (name) VALUES ($1) RETURNING id, name, created_at', [dto.tenantName]);
            const tenant = tenantResult.rows[0];
            // Hash password
            const passwordHash = await bcrypt_1.default.hash(dto.password, SALT_ROUNDS);
            const role = dto.role || 'retailer_owner';
            // Create user
            const userResult = await (0, database_1.query)('INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, tenant_id, email, role, created_at', [tenant.id, dto.email, passwordHash, role]);
            const user = userResult.rows[0];
            await (0, database_1.query)('COMMIT');
            const token = jsonwebtoken_1.default.sign({ userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenant_id,
                    tenantName: tenant.name,
                },
            };
        }
        catch (error) {
            await (0, database_1.query)('ROLLBACK');
            throw error;
        }
    }
    async login(dto) {
        const userResult = await (0, database_1.query)(`SELECT u.id, u.tenant_id, u.email, u.password_hash, u.role, t.name as tenant_name 
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1`, [dto.email]);
        if (userResult.rows.length === 0) {
            throw new Error('Invalid email or password.');
        }
        const user = userResult.rows[0];
        const validPassword = await bcrypt_1.default.compare(dto.password, user.password_hash);
        if (!validPassword) {
            throw new Error('Invalid email or password.');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
                tenantName: user.tenant_name,
            },
        };
    }
}
exports.AuthService = AuthService;
