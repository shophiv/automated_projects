import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AccountingService } from './accounting.service';

export class AccountingController {
  private accountingService = new AccountingService();

  recordExpense = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const expense = await this.accountingService.recordExpense(retailerId, req.body);
      res.status(201).json(expense);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getGeneralLedger = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const ledger = await this.accountingService.getGeneralLedger(retailerId, req.query);
      res.status(200).json(ledger);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getTrialBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const tb = await this.accountingService.getTrialBalance(retailerId);
      res.status(200).json(tb);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const expenses = await this.accountingService.getExpenses(retailerId, req.query);
      res.status(200).json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}