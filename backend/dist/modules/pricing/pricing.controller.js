"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
const pricing_service_1 = require("./pricing.service");
class PricingController {
    pricingService = new pricing_service_1.PricingService();
    configureMargins = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const result = await this.pricingService.configureMargins(retailerId, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getMargins = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const margins = await this.pricingService.getMargins(retailerId);
            res.status(200).json(margins);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}
exports.PricingController = PricingController;
