import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PurchaseOrderService } from './po.service';

export class PurchaseOrderController {
  private poService = new PurchaseOrderService();

  createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const po = await this.poService.createPurchaseOrder(retailerId, req.body);
      res.status(201).json(po);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getPurchaseOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const pos = await this.poService.getPurchaseOrders(retailerId);
      res.status(200).json(pos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getPurchaseOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const poId = parseInt(req.params.id, 10);
      const po = await this.poService.getPurchaseOrderById(retailerId, poId);
      res.status(200).json(po);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  updatePOStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const poId = parseInt(req.params.id, 10);
      const { status } = req.body;
      const updated = await this.poService.updatePOStatus(retailerId, poId, status);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}