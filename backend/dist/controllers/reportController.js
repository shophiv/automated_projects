"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const reportService_1 = require("../services/reportService");
class ReportController {
    static async exportReport(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const reportType = req.query.report_type || 'summary';
            const format = req.query.format || 'csv';
            const startDate = req.query.start_date;
            const endDate = req.query.end_date;
            const report = await reportService_1.ReportService.generateReportData(req.user.tenantId, reportType, startDate, endDate);
            const records = Array.isArray(report.data) ? report.data : [report.data];
            if (format === 'csv') {
                const csv = reportService_1.ReportService.formatAsCSV(reportType, records);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
                res.status(200).send(csv);
                return;
            }
            res.status(200).json({ success: true, format, data: report });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'EXPORT_FAILED', message: error.message } });
        }
    }
}
exports.ReportController = ReportController;
