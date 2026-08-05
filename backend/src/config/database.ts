import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_retail_pos',
});

export const getDatabaseConnection = () => pool;

export const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const migrationPath = path.resolve(__dirname, '../../../../database/schema/001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await client.query(migrationSql);
      console.log('Database migrations executed successfully.');
    } else {
      console.warn('Migration file not found at:', migrationPath);
    }
  } catch (error) {
    console.error('Error running database migrations:', error);
    throw error;
  } finally {
    client.release();
  }
};