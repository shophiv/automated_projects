import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../shared/errors/AppError';

export interface TokenPayload {
  id: string;
  tenant_id?: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token missing or malformed', 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'supersecretkey';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired authentication token', 401);
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }

    next();
  };
};