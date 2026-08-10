import React, { useState } from 'react';
import { apiClient } from '../../../services/apiClient';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.get('/reports/export', {
        params: { report_type: reportType, format, start_date: startDate, end_date: endDate },
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}_report.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert('Report generated successfully!');
        console.log(res.data);
      }
    } catch (error) {
      console.error('Failed to export report', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports & Data Export</h1>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-100 max-w-xl">
        <form onSubmit={handleExport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 w-full border rounded p-2"
            >
              <option value="summary">Business Summary</option>
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="profit">Profit Report</option>
              <option value="expense">Expense Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1 w-full border rounded p-2"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generating Report...' : 'Download Report'}
          </button>
        </form>
      </div>
    </div>
  );
};