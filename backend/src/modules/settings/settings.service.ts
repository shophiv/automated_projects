import { SettingsRepository } from './settings.repository';

export class SettingsService {
  private settingsRepo = new SettingsRepository();

  async getSettings(retailerId: number) {
    return await this.settingsRepo.getSettings(retailerId);
  }

  async updateSettings(retailerId: number, settingsData: { [key: string]: any }) {
    if (!settingsData || typeof settingsData !== 'object') {
      throw new Error('Valid settings object is required');
    }
    return await this.settingsRepo.updateSettings(retailerId, settingsData);
  }
}