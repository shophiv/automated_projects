import { AdminRepository } from './admin.repository';
import { transactionManager } from '../../config/database';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepo = new AdminRepository();

  async getRetailersList(query: any) {
    return await this.adminRepo.getRetailersList(query);
  }

  async updateRetailerStatus(adminId: number, retailerId: number, status: string) {
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

  async deleteRetailer(adminId: number, retailerId: number) {
    return await transactionManager.runInTransaction(async (client) => {
      const deleted = await this.adminRepo.deleteRetailer(retailerId, client);
      if (!deleted) {
        throw new Error('Retailer not found');
      }
      await this.adminRepo.logAdminAction(adminId, 'DELETE_RETAILER', retailerId, `Retailer ${deleted.business_name} deleted`);
      return { message: 'Retailer deleted successfully', retailer: deleted };
    });
  }

  async resetRetailerPassword(adminId: number, retailerId: number, newPassword?: string) {
    const pwd = newPassword || 'Password123!';
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(pwd, salt);

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

  async updateSubscriptionPlan(adminId: number, planId: number, data: any) {
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

  async getSupportLogs(query: any) {
    return await this.adminRepo.getSupportLogs(query);
  }

  async broadcastAnnouncement(adminId: number, announcement: { title: string; message: string }) {
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