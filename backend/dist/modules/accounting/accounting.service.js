"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const accounting_repository_1 = require("./accounting.repository");
class AccountingService {
    accountingRepo = new accounting_repository_1.AccountingRepository();
    async recordExpense(retailerId, data) {
        if (!data.category || typeof data.amount !== 'number' || data.amount <= 0) {
            throw new Error('Valid category and positive amount are required for expense recording');
        }
        return await this.accountingRepo.recordExpense(retailerId, data.category, data.amount, data.description || '', data.expenseDate);
    }
    async getGeneralLedger(retailerId, queryParams) {
        return await this.accountingRepo.getGeneralLedger(retailerId);
    }
    async getTrialBalance(retailerId) {
        return await this.accountingRepo.getTrialBalance(retailerId);
    }
    async getExpenses(retailerId, queryParams) {
        return await this.accountingRepo.getExpenses(retailerId, queryParams);
    }
}
exports.AccountingService = AccountingService;
