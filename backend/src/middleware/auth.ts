import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: 'Owner' | 'Manager' | 'Cashier';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed authorization token' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
    });
  }
};