import { AccountingRepository } from './accounting.repository';

export class AccountingService {
  private accountingRepo = new AccountingRepository();

  async recordExpense(retailerId: number, data: { category: string; amount: number; description: string; expenseDate?: string }) {
    if (!data.category || typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Valid category and positive amount are required for expense recording');
    }
    return await this.accountingRepo.recordExpense(retailerId, data.category, data.amount, data.description || '', data.expenseDate);
  }

  async getGeneralLedger(retailerId: number, queryParams: any) {
    return await this.accountingRepo.getGeneralLedger(retailerId);
  }

  async getTrialBalance(retailerId: number) {
    return await this.accountingRepo.getTrialBalance(retailerId);
  }

  async getExpenses(retailerId: number, queryParams: any) {
    return await this.accountingRepo.getExpenses(retailerId, queryParams);
  }
}