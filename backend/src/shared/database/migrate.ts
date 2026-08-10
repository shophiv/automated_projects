import fs from 'fs';
import path from 'path';
import { pool } from './connection';
import { logger } from '../../config/logger';

export const runMigrations = async () => {
  try {
    const migrationPath1 = path.join(__dirname, '../../../../database/migrations/001_initial_schema.sql');
    if (fs.existsSync(migrationPath1)) {
      const sql = fs.readFileSync(migrationPath1, 'utf8');
      await pool.query(sql);
      logger.info('Migration 001 applied successfully.');
    }

    const migrationPath2 = path.join(__dirname, '../../../../database/migrations/002_phase2_schema.sql');
    if (fs.existsSync(migrationPath2)) {
      const sql = fs.readFileSync(migrationPath2, 'utf8');
      await pool.query(sql);
      logger.info('Migration 002 (Phase 2) applied successfully.');
    } else {
      logger.warn('Migration file 002 not found at path:', migrationPath2);
    }
  } catch (error) {
    logger.error('Failed to run migrations:', error);
    throw error;
  }
};