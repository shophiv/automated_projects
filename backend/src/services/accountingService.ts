import { AccountingRepository, AccountingEntry } from '../repositories/accountingRepository';

export class AccountingService {
  static async recordExpense(
    tenantId: string,
    data: {
      category: string;
      amount: number;
      description?: string;
      date?: string;
    }
  ): Promise<AccountingEntry> {
    return AccountingRepository.create(tenantId, {
      type: 'expense',
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date,
    });
  }

  static async recordIncomeFromSale(
    tenantId: string,
    saleId: string,
    amount: number
  ): Promise<AccountingEntry> {
    return AccountingRepository.create(tenantId, {
      type: 'income',
      category: 'Sales',
      amount,
      reference_id: saleId,
      description: `Revenue from sales transaction ${saleId}`,
    });
  }

  static async getEntries(
    tenantId: string,
    limit: number = 50,
    offset: number = 0,
    type?: string
  ): Promise<{ entries: AccountingEntry[]; total: number }> {
    return AccountingRepository.findByTenant(tenantId, limit, offset, type);
  }

  static async getSummary(tenantId: string, startDate?: string, endDate?: string) {
    return AccountingRepository.getFinancialSummary(tenantId, startDate, endDate);
  }
}