"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("./report.service");
class ReportController {
    reportService = new report_service_1.ReportService();
    generateReport = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const reportType = req.query.type || 'sales';
            const format = req.query.format || 'json';
            const report = await this.reportService.generateReport(retailerId, reportType, format);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
                res.status(200).send(report);
            }
            else {
                res.status(200).json(report);
            }
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.ReportController = ReportController;
