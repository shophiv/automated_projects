import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key';

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  name: string;
  role: 'platform_admin';
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or malformed admin authorization token' } });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Invalid or expired admin token' } });
  }
};