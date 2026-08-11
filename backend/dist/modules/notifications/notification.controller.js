"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
class NotificationController {
    notificationService = new notification_service_1.NotificationService();
    getNotifications = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const notifications = await this.notificationService.getNotifications(retailerId, req.query);
            res.status(200).json(notifications);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    markAsRead = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const notificationId = parseInt(req.params.id, 10);
            const notification = await this.notificationService.markAsRead(retailerId, notificationId);
            res.status(200).json(notification);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
}
exports.NotificationController = NotificationController;
