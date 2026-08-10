import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';

export class ReportController {
  static async exportReport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const reportType = (req.query.report_type as string) || 'summary';
      const format = (req.query.format as string) || 'csv';
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const report = await ReportService.generateReportData(req.user.tenantId, reportType, startDate, endDate);

      const records = Array.isArray(report.data) ? report.data : [report.data];

      if (format === 'csv') {
        const csv = ReportService.formatAsCSV(reportType, records);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
        res.status(200).send(csv);
        return;
      }

      res.status(200).json({ success: true, format, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'EXPORT_FAILED', message: error.message } });
    }
  }
}