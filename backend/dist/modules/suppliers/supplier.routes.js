"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplier_controller_1 = require("./supplier.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const supplierController = new supplier_controller_1.SupplierController();
router.use(auth_middleware_1.verifyToken);
router.get('/', supplierController.getSuppliers);
router.post('/', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('businessName').notEmpty().withMessage('Business name is required'),
    validation_middleware_1.validateInput
], supplierController.createSupplier);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), supplierController.updateSupplier);
router.patch('/:id/deactivate', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), supplierController.deactivateSupplier);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), supplierController.deleteSupplier);
router.get('/:id/reports', supplierController.getSupplierReports);
exports.default = router;
