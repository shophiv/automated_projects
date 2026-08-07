import fs from 'fs';
import path from 'path';
import { pool } from './connection';
import { logger } from '../../config/logger';

export const runMigrations = async () => {
  try {
    const migrationPath = path.join(__dirname, '../../../../database/migrations/001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      logger.info('Database migrations applied successfully.');
    } else {
      logger.warn('Migration file not found at path:', migrationPath);
    }
  } catch (error) {
    logger.error('Failed to run migrations:', error);
    throw error;
  }
};