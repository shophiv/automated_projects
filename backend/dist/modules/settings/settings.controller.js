"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const settings_service_1 = require("./settings.service");
class SettingsController {
    settingsService = new settings_service_1.SettingsService();
    getSettings = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const settings = await this.settingsService.getSettings(retailerId);
            res.status(200).json(settings);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    updateSettings = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const settings = await this.settingsService.updateSettings(retailerId, req.body);
            res.status(200).json(settings);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.SettingsController = SettingsController;
