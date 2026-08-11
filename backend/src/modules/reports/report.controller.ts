import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReportService } from './report.service';

export class ReportController {
  private reportService = new ReportService();

  generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const reportType = (req.query.type as string) || 'sales';
      const format = (req.query.format as string) || 'json';

      const report = await this.reportService.generateReport(retailerId, reportType, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
        res.status(200).send(report);
      } else {
        res.status(200).json(report);
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}