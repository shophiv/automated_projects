import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', code: 403, message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}