"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = exports.getDatabaseConnection = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_retail_pos',
});
const getDatabaseConnection = () => pool;
exports.getDatabaseConnection = getDatabaseConnection;
const runMigrations = async () => {
    const client = await pool.connect();
    try {
        const migrationPath = path_1.default.resolve(__dirname, '../../../../database/schema/001_initial_schema.sql');
        if (fs_1.default.existsSync(migrationPath)) {
            const migrationSql = fs_1.default.readFileSync(migrationPath, 'utf-8');
            await client.query(migrationSql);
            console.log('Database migrations executed successfully.');
        }
        else {
            console.warn('Migration file not found at:', migrationPath);
        }
    }
    catch (error) {
        console.error('Error running database migrations:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.runMigrations = runMigrations;
