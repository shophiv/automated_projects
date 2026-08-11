import { NotificationRepository } from './notification.repository';

export class NotificationService {
  private notificationRepo = new NotificationRepository();

  async createNotification(retailerId: number, data: { userId?: number; title: string; message: string; type: string }) {
    if (!data.title || !data.message || !data.type) {
      throw new Error('Title, message, and type are required for notification creation');
    }
    return await this.notificationRepo.createNotification(retailerId, data.userId || null, data.title, data.message, data.type);
  }

  async getNotifications(retailerId: number, queryParams: any) {
    const unreadOnly = queryParams?.unread === 'true';
    return await this.notificationRepo.getNotifications(retailerId, unreadOnly);
  }

  async markAsRead(retailerId: number, notificationId: number) {
    const notification = await this.notificationRepo.markAsRead(retailerId, notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }
}