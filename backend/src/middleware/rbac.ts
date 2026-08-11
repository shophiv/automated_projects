import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: Array<'Owner' | 'Manager' | 'Cashier' | 'platform_admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User context not found' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions to access this resource' },
      });
      return;
    }

    next();
  };
};