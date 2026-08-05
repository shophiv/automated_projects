import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

export interface TenantRequest extends AuthenticatedRequest {
  tenantId?: number | null;
}

export const resolveTenant = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (req.user) {
    req.tenantId = req.user.tenantId;
    if (req.user.role !== 'admin' && !req.tenantId) {
      res.status(403).json({ error: 'Tenant context could not be resolved' });
      return;
    }
  }
  next();
};