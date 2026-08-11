"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("./inventory.service");
class InventoryController {
    inventoryService = new inventory_service_1.InventoryService();
    recordStockIn = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const log = await this.inventoryService.recordStockIn(retailerId, req.body);
            res.status(201).json(log);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    recordStockOut = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const log = await this.inventoryService.recordStockOut(retailerId, req.body);
            res.status(201).json(log);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    adjustStock = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const log = await this.inventoryService.adjustStock(retailerId, req.body);
            res.status(201).json(log);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    transferStock = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const log = await this.inventoryService.transferStock(retailerId, req.body);
            res.status(201).json(log);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getStockHistory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const history = await this.inventoryService.getStockHistory(retailerId, req.query);
            res.status(200).json(history);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getInventoryValuation = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const valuation = await this.inventoryService.getInventoryValuation(retailerId);
            res.status(200).json(valuation);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    checkStockAlerts = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const alerts = await this.inventoryService.checkStockAlerts(retailerId);
            res.status(200).json(alerts);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}
exports.InventoryController = InventoryController;
