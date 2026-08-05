"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_js_1 = require("../config/database.js");
class UserRepository {
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await database_js_1.pool.query(query, [email]);
        return result.rows[0] || null;
    }
    async findAllTenants() {
        const query = 'SELECT * FROM tenants ORDER BY created_at DESC';
        const result = await database_js_1.pool.query(query);
        return result.rows;
    }
    async createTenant(name, subscriptionStatus = 'active') {
        const query = 'INSERT INTO tenants (name, subscription_status) VALUES ($1, $2) RETURNING *';
        const result = await database_js_1.pool.query(query, [name, subscriptionStatus]);
        return result.rows[0];
    }
    async createUser(tenantId, email, passwordHash, role) {
        const query = 'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await database_js_1.pool.query(query, [tenantId, email, passwordHash, role]);
        return result.rows[0];
    }
}
exports.UserRepository = UserRepository;
