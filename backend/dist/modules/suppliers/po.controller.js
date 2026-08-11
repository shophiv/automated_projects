"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const po_service_1 = require("./po.service");
class PurchaseOrderController {
    poService = new po_service_1.PurchaseOrderService();
    createPurchaseOrder = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const po = await this.poService.createPurchaseOrder(retailerId, req.body);
            res.status(201).json(po);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getPurchaseOrders = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const pos = await this.poService.getPurchaseOrders(retailerId);
            res.status(200).json(pos);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getPurchaseOrderById = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const poId = parseInt(req.params.id, 10);
            const po = await this.poService.getPurchaseOrderById(retailerId, poId);
            res.status(200).json(po);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    updatePOStatus = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const poId = parseInt(req.params.id, 10);
            const { status } = req.body;
            const updated = await this.poService.updatePOStatus(retailerId, poId, status);
            res.status(200).json(updated);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.PurchaseOrderController = PurchaseOrderController;
