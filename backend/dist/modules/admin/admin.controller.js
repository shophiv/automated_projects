"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
class AdminController {
    adminService = new admin_service_1.AdminService();
    getRetailersList = async (req, res) => {
        try {
            const retailers = await this.adminService.getRetailersList(req.query);
            res.status(200).json(retailers);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    updateRetailerStatus = async (req, res) => {
        try {
            const adminId = req.user.userId;
            const retailerId = parseInt(req.params.id, 10);
            const { status } = req.body;
            const updated = await this.adminService.updateRetailerStatus(adminId, retailerId, status);
            res.status(200).json(updated);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    deleteRetailer = async (req, res) => {
        try {
            const adminId = req.user.userId;
            const retailerId = parseInt(req.params.id, 10);
            const result = await this.adminService.deleteRetailer(adminId, retailerId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    resetRetailerPassword = async (req, res) => {
        try {
            const adminId = req.user.userId;
            const retailerId = parseInt(req.params.id, 10);
            const { newPassword } = req.body;
            const result = await this.adminService.resetRetailerPassword(adminId, retailerId, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getSubscriptions = async (req, res) => {
        try {
            const subs = await this.adminService.getSubscriptions();
            res.status(200).json(subs);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    updateSubscriptionPlan = async (req, res) => {
        try {
            const adminId = req.user.userId;
            const planId = parseInt(req.params.id, 10);
            const updated = await this.adminService.updateSubscriptionPlan(adminId, planId, req.body);
            res.status(200).json(updated);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getPlatformAnalytics = async (req, res) => {
        try {
            const analytics = await this.adminService.getPlatformAnalytics();
            res.status(200).json(analytics);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getSupportLogs = async (req, res) => {
        try {
            const logs = await this.adminService.getSupportLogs(req.query);
            res.status(200).json(logs);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    broadcastAnnouncement = async (req, res) => {
        try {
            const adminId = req.user.userId;
            const result = await this.adminService.broadcastAnnouncement(adminId, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AdminController = AdminController;
