"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const predictionService_1 = require("../services/predictionService");
class AnalyticsController {
    static async getSalesAnalytics(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const interval = req.query.interval || 'daily';
            const analytics = await analyticsService_1.AnalyticsService.getSalesAnalytics(req.user.tenantId, interval);
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async getPredictions(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const predictions = await predictionService_1.PredictionService.generateForecasts(req.user.tenantId);
            res.status(200).json({ success: true, data: predictions });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
