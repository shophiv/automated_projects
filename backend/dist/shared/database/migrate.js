"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./connection");
const logger_1 = require("../../config/logger");
const runMigrations = async () => {
    try {
        const migrationPath = path_1.default.join(__dirname, '../../../../database/migrations/001_initial_schema.sql');
        if (fs_1.default.existsSync(migrationPath)) {
            const sql = fs_1.default.readFileSync(migrationPath, 'utf8');
            await connection_1.pool.query(sql);
            logger_1.logger.info('Database migrations applied successfully.');
        }
        else {
            logger_1.logger.warn('Migration file not found at path:', migrationPath);
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to run migrations:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
