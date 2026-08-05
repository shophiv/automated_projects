"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventoryService_1 = require("./inventoryService");
class InventoryController {
    inventoryService;
    constructor() {
        this.inventoryService = new inventoryService_1.InventoryService();
    }
    getInventory = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const inventory = await this.inventoryService.getInventory(tenantId);
            res.status(200).json({ status: 'success', data: inventory });
        }
        catch (error) {
            res.status(400).json({ error: { code: 'FETCH_INVENTORY_FAILED', message: error.message } });
        }
    };
    updateInventory = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const productId = parseInt(req.params.productId, 10);
            const inventory = await this.inventoryService.updateInventory(tenantId, productId, req.body);
            res.status(200).json({ status: 'success', data: inventory });
        }
        catch (error) {
            res.status(400).json({ error: { code: 'UPDATE_INVENTORY_FAILED', message: error.message } });
        }
    };
}
exports.InventoryController = InventoryController;
