import { Response } from 'express';
import { InventoryService } from './inventoryService';
import { AuthRequest } from '../auth/authMiddleware';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  public getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const inventory = await this.inventoryService.getInventory(tenantId);
      res.status(200).json({ status: 'success', data: inventory });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'FETCH_INVENTORY_FAILED', message: error.message } });
    }
  };

  public updateInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const productId = parseInt(req.params.productId, 10);
      const inventory = await this.inventoryService.updateInventory(tenantId, productId, req.body);
      res.status(200).json({ status: 'success', data: inventory });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'UPDATE_INVENTORY_FAILED', message: error.message } });
    }
  };
}