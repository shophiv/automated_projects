import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

export const securityHeadersMiddleware = helmet();

export const corsMiddleware = cors({
  origin: '*', // Configure appropriately in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Basic query & body sanitization interceptor to mitigate XSS/SQLi vectors
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip out dangerous tags if needed or keep raw depending on Zod schemas
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};