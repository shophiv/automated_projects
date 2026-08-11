import { Request, Response } from 'express';
import { AdminService } from '../../services/adminService';
import { NotificationService } from '../../services/notificationService';

export class PlatformController {
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await AdminService.getPlatformAnalytics();
      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async getSupportLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await AdminService.getSupportLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async broadcastAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      if (!message || message.trim() === '') {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Announcement message is required' } });
        return;
      }

      await NotificationService.broadcastToAllTenants('announcement', message);
      res.status(201).json({ success: true, message: 'Announcement broadcasted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'BROADCAST_FAILED', message: error.message } });
    }
  }

  static async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
        return;
      }

      const result = await AdminService.loginAdmin(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_FAILED', message: error.message } });
    }
  }
}