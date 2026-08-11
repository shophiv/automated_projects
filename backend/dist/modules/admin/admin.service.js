"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("./admin.repository");
const database_1 = require("../../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AdminService {
    adminRepo = new admin_repository_1.AdminRepository();
    async getRetailersList(query) {
        return await this.adminRepo.getRetailersList(query);
    }
    async updateRetailerStatus(adminId, retailerId, status) {
        if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
            throw new Error('Invalid status value');
        }
        const updated = await this.adminRepo.updateRetailerStatus(retailerId, status);
        if (!updated) {
            throw new Error('Retailer not found');
        }
        await this.adminRepo.logAdminAction(adminId, `UPDATE_STATUS_${status}`, retailerId, `Status changed to ${status}`);
        return updated;
    }
    async deleteRetailer(adminId, retailerId) {
        return await database_1.transactionManager.runInTransaction(async (client) => {
            const deleted = await this.adminRepo.deleteRetailer(retailerId, client);
            if (!deleted) {
                throw new Error('Retailer not found');
            }
            await this.adminRepo.logAdminAction(adminId, 'DELETE_RETAILER', retailerId, `Retailer ${deleted.business_name} deleted`);
            return { message: 'Retailer deleted successfully', retailer: deleted };
        });
    }
    async resetRetailerPassword(adminId, retailerId, newPassword) {
        const pwd = newPassword || 'Password123!';
        const salt = await bcrypt_1.default.genSalt(12);
        const hashed = await bcrypt_1.default.hash(pwd, salt);
        const user = await this.adminRepo.resetRetailerPassword(retailerId, hashed);
        if (!user) {
            throw new Error('Retailer owner user not found');
        }
        await this.adminRepo.logAdminAction(adminId, 'RESET_PASSWORD', retailerId, `Password reset for owner ${user.email}`);
        return { message: 'Password reset successfully', tempPassword: pwd };
    }
    async getSubscriptions() {
        return await this.adminRepo.getSubscriptions();
    }
    async updateSubscriptionPlan(adminId, planId, data) {
        const featuresStr = typeof data.features_json === 'string' ? data.features_json : JSON.stringify(data.features_json || {});
        const updated = await this.adminRepo.updateSubscriptionPlan(planId, {
            max_users: data.max_users,
            max_products: data.max_products,
            storage_limit: data.storage_limit,
            price: data.price,
            features_json: featuresStr
        });
        if (!updated) {
            throw new Error('Subscription plan not found');
        }
        await this.adminRepo.logAdminAction(adminId, 'UPDATE_SUBSCRIPTION', undefined, `Updated plan ${updated.name}`);
        return updated;
    }
    async getPlatformAnalytics() {
        return await this.adminRepo.getPlatformAnalytics();
    }
    async getSupportLogs(query) {
        return await this.adminRepo.getSupportLogs(query);
    }
    async broadcastAnnouncement(adminId, announcement) {
        if (!announcement.title || !announcement.message) {
            throw new Error('Title and message are required for broadcast');
        }
        await this.adminRepo.logAdminAction(adminId, 'BROADCAST', undefined, `Broadcast: ${announcement.title}`);
        return {
            message: 'Announcement broadcasted successfully',
            announcement
        };
    }
}
exports.AdminService = AdminService;
