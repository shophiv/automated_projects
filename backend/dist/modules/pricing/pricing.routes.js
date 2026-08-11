"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_controller_1 = require("./pricing.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const pricingController = new pricing_controller_1.PricingController();
router.use(auth_middleware_1.verifyToken);
router.get('/margins', pricingController.getMargins);
router.put('/margins', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('globalMargin').optional().isNumeric().withMessage('Global margin must be a number'),
    validation_middleware_1.validateInput
], pricingController.configureMargins);
exports.default = router;
