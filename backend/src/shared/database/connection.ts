import { Pool } from 'pg';
import { ENV } from '../../config/env';
import { logger } from '../../config/logger';

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});

pool.on('connect', () => {
  logger.debug('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
};