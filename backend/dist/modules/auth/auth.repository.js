"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const connection_1 = require("../../shared/database/connection");
class AuthRepository {
    async findRetailerByEmail(email) {
        const res = await (0, connection_1.query)('SELECT * FROM retailers WHERE email = $1', [email]);
        return res.rows[0];
    }
    async findUserByEmail(email) {
        const res = await (0, connection_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    }
    async createRetailer(data) {
        const res = await (0, connection_1.query)(`INSERT INTO retailers (business_name, owner_name, email, password_hash, phone, address, subscription_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [data.businessName, data.ownerName, data.email, data.passwordHash, data.phone, data.address, data.subscriptionId]);
        return res.rows[0];
    }
    async createUser(data) {
        const res = await (0, connection_1.query)(`INSERT INTO users (retailer_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [data.retailerId, data.name, data.email, data.passwordHash, data.role]);
        return res.rows[0];
    }
    async findUsersByRetailerId(retailerId) {
        const res = await (0, connection_1.query)('SELECT id, retailer_id, name, email, role, status, created_at FROM users WHERE retailer_id = $1', [retailerId]);
        return res.rows;
    }
}
exports.AuthRepository = AuthRepository;
