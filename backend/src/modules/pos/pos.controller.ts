import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { POSService } from './pos.service';

export class POSController {
  private posService = new POSService();

  lookupByBarcode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const { barcode } = req.params;
      const product = await this.posService.lookupByBarcode(retailerId, barcode);
      res.status(200).json(product);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  processSale = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const cashierId = req.user!.userId;
      const sale = await this.posService.processSale(retailerId, cashierId, req.body);
      res.status(201).json(sale);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  holdSale = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const held = this.posService.holdSale(retailerId, req.body);
      res.status(201).json(held);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getHeldSales = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const held = this.posService.getHeldSales(retailerId);
      res.status(200).json(held);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  resumeSale = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const { id } = req.params;
      const held = this.posService.resumeSale(retailerId, id);
      res.status(200).json(held);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  deleteHeldSale = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const { id } = req.params;
      const result = this.posService.deleteHeldSale(retailerId, id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
}