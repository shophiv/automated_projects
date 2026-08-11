"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSController = void 0;
const pos_service_1 = require("./pos.service");
class POSController {
    posService = new pos_service_1.POSService();
    lookupByBarcode = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const { barcode } = req.params;
            const product = await this.posService.lookupByBarcode(retailerId, barcode);
            res.status(200).json(product);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    processSale = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const cashierId = req.user.userId;
            const sale = await this.posService.processSale(retailerId, cashierId, req.body);
            res.status(201).json(sale);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    holdSale = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const held = this.posService.holdSale(retailerId, req.body);
            res.status(201).json(held);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getHeldSales = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const held = this.posService.getHeldSales(retailerId);
            res.status(200).json(held);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    resumeSale = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const { id } = req.params;
            const held = this.posService.resumeSale(retailerId, id);
            res.status(200).json(held);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    deleteHeldSale = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const { id } = req.params;
            const result = this.posService.deleteHeldSale(retailerId, id);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
}
exports.POSController = POSController;
