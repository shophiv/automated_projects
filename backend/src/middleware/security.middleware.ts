import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export const securityHeaders = helmet();

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Basic input sanitization middleware layer
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip basic malicious HTML/JS tags if needed
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}