"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pos_controller_1 = require("./pos.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const posController = new pos_controller_1.POSController();
router.use(auth_middleware_1.verifyToken);
router.get('/products/barcode/:barcode', posController.lookupByBarcode);
router.post('/sales', [
    (0, express_validator_1.body)('paymentMethod').notEmpty().withMessage('Payment method is required'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Cart must contain at least one item'),
    (0, express_validator_1.body)('items.*.productId').isInt().withMessage('Valid product ID is required for each item'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each item'),
    validation_middleware_1.validateInput
], posController.processSale);
router.post('/sales/hold', [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Cart cannot be empty when holding'),
    validation_middleware_1.validateInput
], posController.holdSale);
router.get('/sales/held', posController.getHeldSales);
router.post('/sales/held/:id/resume', posController.resumeSale);
router.delete('/sales/held/:id', posController.deleteHeldSale);
exports.default = router;
