import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_retail_key';

export interface TokenPayload {
  userId: number;
  tenantId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
  tenantId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token missing.' } });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Invalid or expired token.' } });
      return;
    }
    req.user = user as TokenPayload;
    next();
  });
};