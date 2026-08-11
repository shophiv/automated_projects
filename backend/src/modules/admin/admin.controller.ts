import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AppError } from '../../shared/errors/AppError';
import { TenantStatus } from '@prisma/client';

export class AdminController {
  private adminService = new AdminService();

  getRetailers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as TenantStatus | undefined;

      const retailers = await this.adminService.getRetailers(search, status);
      return res.status(200).json({
        status: 'success',
        data: retailers,
      });
    } catch (error) {
      next(error);
    }
  };

  getRetailerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const retailer = await this.adminService.getRetailerById(id);
      return res.status(200).json({
        status: 'success',
        data: retailer,
      });
    } catch (error) {
      next(error);
    }
  };

  approveRetailer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.approveRetailer(id);
      return res.status(200).json({
        status: 'success',
        message: 'Retailer successfully approved',
      });
    } catch (error) {
      next(error);
    }
  };

  updateRetailerStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
        throw new AppError('Valid status is required', 400);
      }

      await this.adminService.updateRetailerStatus(id, status as TenantStatus);
      return res.status(200).json({
        status: 'success',
        message: `Retailer status successfully updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRetailer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteRetailer(id);
      return res.status(200).json({
        status: 'success',
        message: 'Retailer successfully deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}