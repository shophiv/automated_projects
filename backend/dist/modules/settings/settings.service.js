"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repository_1 = require("./settings.repository");
class SettingsService {
    settingsRepo = new settings_repository_1.SettingsRepository();
    async getSettings(retailerId) {
        return await this.settingsRepo.getSettings(retailerId);
    }
    async updateSettings(retailerId, settingsData) {
        if (!settingsData || typeof settingsData !== 'object') {
            throw new Error('Valid settings object is required');
        }
        return await this.settingsRepo.updateSettings(retailerId, settingsData);
    }
}
exports.SettingsService = SettingsService;
