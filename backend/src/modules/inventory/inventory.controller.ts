import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { InventoryService } from './inventory.service';

export class InventoryController {
  private inventoryService = new InventoryService();

  recordStockIn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const log = await this.inventoryService.recordStockIn(retailerId, req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  recordStockOut = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const log = await this.inventoryService.recordStockOut(retailerId, req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const log = await this.inventoryService.adjustStock(retailerId, req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  transferStock = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const log = await this.inventoryService.transferStock(retailerId, req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getStockHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const history = await this.inventoryService.getStockHistory(retailerId, req.query);
      res.status(200).json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getInventoryValuation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const valuation = await this.inventoryService.getInventoryValuation(retailerId);
      res.status(200).json(valuation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  checkStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const alerts = await this.inventoryService.checkStockAlerts(retailerId);
      res.status(200).json(alerts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}