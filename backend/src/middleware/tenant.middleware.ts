import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    tenantId: number | null;
    role: string;
    email: string;
  };
}

export const tenantIsolationMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or malformed authorization token' } });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      tenantId: number | null;
      role: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Invalid or expired token' } });
  }
};