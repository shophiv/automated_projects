"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accounting_controller_1 = require("./accounting.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const accountingController = new accounting_controller_1.AccountingController();
router.use(auth_middleware_1.verifyToken);
router.get('/ledger', accountingController.getGeneralLedger);
router.get('/trial-balance', accountingController.getTrialBalance);
router.get('/expenses', accountingController.getExpenses);
router.post('/expenses', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Valid amount is required'),
    validation_middleware_1.validateInput
], accountingController.recordExpense);
exports.default = router;
