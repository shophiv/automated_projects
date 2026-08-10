"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = void 0;
const database_1 = require("../config/database");
const withTransaction = async (callback) => {
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.withTransaction = withTransaction;
