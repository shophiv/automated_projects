"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const prediction_service_1 = require("./prediction.service");
class AnalyticsController {
    analyticsService = new analytics_service_1.AnalyticsService();
    predictionService = new prediction_service_1.PredictionService();
    getSalesHistory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const history = await this.analyticsService.getSalesHistory(retailerId, req.query);
            res.status(200).json(history);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getSaleById = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const saleId = parseInt(req.params.id, 10);
            const sale = await this.analyticsService.getSaleById(retailerId, saleId);
            res.status(200).json(sale);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    processRefund = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const saleId = parseInt(req.params.id, 10);
            const result = await this.analyticsService.processRefund(retailerId, saleId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    reprintInvoice = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const saleId = parseInt(req.params.id, 10);
            const result = await this.analyticsService.reprintInvoice(retailerId, saleId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    getSalesAnalytics = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const timeframe = req.query.timeframe;
            const analytics = await this.analyticsService.getSalesAnalytics(retailerId, timeframe);
            res.status(200).json(analytics);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getSalesPredictions = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const predictions = await this.predictionService.getPredictions(retailerId);
            res.status(200).json(predictions);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}
exports.AnalyticsController = AnalyticsController;
