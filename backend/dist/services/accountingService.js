"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const accountingRepository_1 = require("../repositories/accountingRepository");
class AccountingService {
    static async recordExpense(tenantId, data) {
        return accountingRepository_1.AccountingRepository.create(tenantId, {
            type: 'expense',
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: data.date,
        });
    }
    static async recordIncomeFromSale(tenantId, saleId, amount) {
        return accountingRepository_1.AccountingRepository.create(tenantId, {
            type: 'income',
            category: 'Sales',
            amount,
            reference_id: saleId,
            description: `Revenue from sales transaction ${saleId}`,
        });
    }
    static async getEntries(tenantId, limit = 50, offset = 0, type) {
        return accountingRepository_1.AccountingRepository.findByTenant(tenantId, limit, offset, type);
    }
    static async getSummary(tenantId, startDate, endDate) {
        return accountingRepository_1.AccountingRepository.getFinancialSummary(tenantId, startDate, endDate);
    }
}
exports.AccountingService = AccountingService;
