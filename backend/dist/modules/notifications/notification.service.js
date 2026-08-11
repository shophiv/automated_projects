"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("./notification.repository");
class NotificationService {
    notificationRepo = new notification_repository_1.NotificationRepository();
    async createNotification(retailerId, data) {
        if (!data.title || !data.message || !data.type) {
            throw new Error('Title, message, and type are required for notification creation');
        }
        return await this.notificationRepo.createNotification(retailerId, data.userId || null, data.title, data.message, data.type);
    }
    async getNotifications(retailerId, queryParams) {
        const unreadOnly = queryParams?.unread === 'true';
        return await this.notificationRepo.getNotifications(retailerId, unreadOnly);
    }
    async markAsRead(retailerId, notificationId) {
        const notification = await this.notificationRepo.markAsRead(retailerId, notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    }
}
exports.NotificationService = NotificationService;
