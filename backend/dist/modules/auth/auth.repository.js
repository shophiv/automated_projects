"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../../config/database");
class AuthRepository {
    async findUserByEmailAndTenant(email, tenantId) {
        const query = 'SELECT * FROM users WHERE email = $1 AND tenant_id = $2';
        const result = await database_1.pool.query(query, [email, tenantId]);
        return result.rows[0] || null;
    }
    async findUserById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await database_1.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await database_1.pool.query(query, [email]);
        return result.rows[0] || null;
    }
}
exports.AuthRepository = AuthRepository;
