"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const inventoryController = new inventory_controller_1.InventoryController();
router.use(auth_middleware_1.verifyToken);
router.get('/history', inventoryController.getStockHistory);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/alerts', inventoryController.checkStockAlerts);
router.post('/stock-in', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('productId').isInt().withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validation_middleware_1.validateInput
], inventoryController.recordStockIn);
router.post('/stock-out', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('productId').isInt().withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validation_middleware_1.validateInput
], inventoryController.recordStockOut);
router.post('/adjustment', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('productId').isInt().withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('newQuantity').isInt({ min: 0 }).withMessage('New quantity must be non-negative'),
    validation_middleware_1.validateInput
], inventoryController.adjustStock);
router.post('/transfer', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('productId').isInt().withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validation_middleware_1.validateInput
], inventoryController.transferStock);
exports.default = router;
