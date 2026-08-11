"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformController = void 0;
const adminService_1 = require("../../services/adminService");
const notificationService_1 = require("../../services/notificationService");
class PlatformController {
    static async getAnalytics(req, res) {
        try {
            const analytics = await adminService_1.AdminService.getPlatformAnalytics();
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async getSupportLogs(req, res) {
        try {
            const logs = await adminService_1.AdminService.getSupportLogs();
            res.status(200).json({ success: true, data: logs });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async broadcastAnnouncement(req, res) {
        try {
            const { message } = req.body;
            if (!message || message.trim() === '') {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Announcement message is required' } });
                return;
            }
            await notificationService_1.NotificationService.broadcastToAllTenants('announcement', message);
            res.status(201).json({ success: true, message: 'Announcement broadcasted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'BROADCAST_FAILED', message: error.message } });
        }
    }
    static async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
                return;
            }
            const result = await adminService_1.AdminService.loginAdmin(email, password);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_FAILED', message: error.message } });
        }
    }
}
exports.PlatformController = PlatformController;
