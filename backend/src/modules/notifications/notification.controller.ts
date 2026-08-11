import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { NotificationService } from './notification.service';

export class NotificationController {
  private notificationService = new NotificationService();

  getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const notifications = await this.notificationService.getNotifications(retailerId, req.query);
      res.status(200).json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const notificationId = parseInt(req.params.id, 10);
      const notification = await this.notificationService.markAsRead(retailerId, notificationId);
      res.status(200).json(notification);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
}