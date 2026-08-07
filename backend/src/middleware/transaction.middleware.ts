import { Request, Response, NextFunction } from 'express';
import { getClient } from '../config/database';
import { PoolClient } from 'pg';

export interface TransactionRequest extends Request {
  dbClient?: PoolClient;
}

export const transactionMiddleware = async (
  req: TransactionRequest,
  res: Response,
  next: NextFunction
) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const client = await getClient();
  req.dbClient = client;

  try {
    await client.query('BEGIN');
    
    let committed = false;
    
    res.on('finish', async () => {
      if (!committed) {
        try {
          if (res.statusCode >= 400) {
            await client.query('ROLLBACK');
          } else {
            await client.query('COMMIT');
          }
          committed = true;
        } catch (err) {
          console.error('Transaction commit/rollback error on finish', err);
        } finally {
          client.release();
        }
      }
    });

    res.on('close', async () => {
      if (!committed) {
        try {
          await client.query('ROLLBACK');
          committed = true;
        } catch (err) {
          console.error('Transaction rollback error on close', err);
        } finally {
          client.release();
        }
      }
    });

    next();
  } catch (error) {
    client.release();
    next(error);
  }
};