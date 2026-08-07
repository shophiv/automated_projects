"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
exports.pool = new pg_1.Pool({
    connectionString: env_1.ENV.DATABASE_URL,
});
exports.pool.on('connect', () => {
    logger_1.logger.debug('Connected to PostgreSQL database');
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Unexpected error on idle database client', err);
    process.exit(-1);
});
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    }
    catch (error) {
        logger_1.logger.error('Query error', { text, error });
        throw error;
    }
};
exports.query = query;
