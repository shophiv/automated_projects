"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const po_controller_1 = require("./po.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const poController = new po_controller_1.PurchaseOrderController();
router.use(auth_middleware_1.verifyToken);
router.get('/', poController.getPurchaseOrders);
router.get('/:id', poController.getPurchaseOrderById);
router.post('/', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('supplierId').isInt().withMessage('Valid supplier ID is required'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.productId').isInt().withMessage('Valid product ID required for each item'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('items.*.unitCost').isNumeric().withMessage('Unit cost must be a number'),
    validation_middleware_1.validateInput
], poController.createPurchaseOrder);
router.put('/:id/status', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('status').notEmpty().withMessage('Status is required'),
    validation_middleware_1.validateInput
], poController.updatePOStatus);
exports.default = router;
