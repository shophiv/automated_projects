import { Response, NextFunction } from 'express';
import { AuthRequest } from '../modules/auth/authMiddleware';

export const tenantContextMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.tenantId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context missing or unauthorized.' } });
    return;
  }
  req.tenantId = req.user.tenantId;
  next();
};