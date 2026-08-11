"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const accounting_service_1 = require("./accounting.service");
class AccountingController {
    accountingService = new accounting_service_1.AccountingService();
    recordExpense = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const expense = await this.accountingService.recordExpense(retailerId, req.body);
            res.status(201).json(expense);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getGeneralLedger = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const ledger = await this.accountingService.getGeneralLedger(retailerId, req.query);
            res.status(200).json(ledger);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getTrialBalance = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const tb = await this.accountingService.getTrialBalance(retailerId);
            res.status(200).json(tb);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getExpenses = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const expenses = await this.accountingService.getExpenses(retailerId, req.query);
            res.status(200).json(expenses);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}
exports.AccountingController = AccountingController;
