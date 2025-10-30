import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PayrollEntry, Employee, Department } from '../types';
import { Banknote, FileText, Printer, Users, Download } from 'lucide-react';
import PrintPreview from './PrintPreview';

interface ReportsProps {
  payrollData: PayrollEntry[];
  employees: Employee[];
}

const Reports: React.FC<ReportsProps> = ({ payrollData: initialPayrollData, employees }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

  // This is a placeholder as we don't have historical data. In a real app, this would fetch data.
  const calculatePayrollForPeriod = (y: number, m: number): PayrollEntry[] => {
     const currentMonth = new Date().getMonth();
     const currentYear = new Date().getFullYear();
     if (y === currentYear && m === currentMonth) {
         return initialPayrollData;
     }
     return [];
  };

  const reportData = useMemo(() => {
    if (reportType === 'monthly') {
      return calculatePayrollForPeriod(year, month);
    } else { // yearly
      // Simulation: Use current month's data as a template for yearly aggregation.
      // In a real app, you would fetch and aggregate data for all 12 months.
      return calculatePayrollForPeriod(new Date().getFullYear(), new Date().getMonth());
    }
  }, [reportType, year, month, initialPayrollData]);

  const { kpis, departmentData } = useMemo(() => {
    const isYearly = reportType === 'yearly';
    const multiplier = isYearly ? 12 : 1;

    const totalGross = reportData.reduce((sum, item) => sum + item.grossPay, 0) * multiplier;
    const totalDeductions = reportData.reduce((sum, item) => sum + item.totalDeductions, 0) * multiplier;
    const totalNet = reportData.reduce((sum, item) => sum + item.netPay, 0) * multiplier;

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const deptData = Object.values(Department).map(dept => {
        const payrollInDept = reportData
            .filter(entry => employeeMap.get(entry.employeeId)?.department === dept)
            .reduce((sum, item) => sum + item.netPay, 0) * multiplier;
        return { name: dept, payroll: payrollInDept };
    }).filter(d => d.payroll > 0);

    return {
        kpis: {
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: new Set(reportData.map(d => d.employeeId)).size,
        },
        departmentData: deptData,
    };
  }, [reportData, employees, reportType]);
  
  const handleExportCsv = () => {
    const employeeMap = new Map(employees.map(e => [e.id, e]));
    const headers = ['Employee ID', 'Name', 'Department', 'Position', 'Gross Pay (MMK)', 'Total Deductions (MMK)', 'Net Pay (MMK)', 'Manual Deduction Reason'];
    
    const rows = reportData.map(entry => {
        const emp = employeeMap.get(entry.employeeId);
        return [
            entry.employeeId,
            emp?.name || 'N/A',
            emp?.department || 'N/A',
            emp?.position || 'N/A',
            entry.grossPay.toFixed(2),
            entry.totalDeductions.toFixed(2),
            entry.netPay.toFixed(2),
            entry.manualDeductionReason || ''
        ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = reportType === 'monthly' ? `Payroll_Report_${year}_${months[month]}.csv` : `Payroll_Report_Annual_${year}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string; }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">{icon}</div>
      <div className="ml-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );

  const ReportContent = () => (
    <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-gray-900 printable-content">
      <header className="print:text-black">
        <h2 className="text-3xl font-bold">Payroll Report</h2>
        <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">
            {reportType === 'monthly' ? `Report for ${months[month]}, ${year}` : `Annual Report for ${year}`}
        </p>
      </header>
       {!reportData.length ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No Payroll Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please calculate payroll for the selected period to generate a report.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users size={24}/>} title="Active Employees" value={String(kpis.employeeCount)} />
                <StatCard icon={<Banknote size={24}/>} title="Total Gross Pay (MMK)" value={kpis.totalGross.toLocaleString('en-US', {maximumFractionDigits: 0})} />
                <StatCard icon={<FileText size={24}/>} title="Total Deductions (MMK)" value={kpis.totalDeductions.toLocaleString('en-US', {maximumFractionDigits: 0})} />
                <StatCard icon={<Banknote size={24}/>} title="Total Net Pay (MMK)" value={kpis.totalNet.toLocaleString('en-US', {maximumFractionDigits: 0})} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md print:shadow-none print:border print:border-gray-200">
                <h3 className="text-xl font-semibold mb-4 print:text-black">Net Payroll Distribution by Department (MMK)</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" angle={-25} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12, fill: 'currentColor' }} />
                            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', color: '#fff', borderRadius: '0.5rem' }} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} />
                            <Legend />
                            <Bar dataKey="payroll" fill="#3b82f6" name="Net Payroll (MMK)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap no-print">
            <div className="flex items-center gap-4">
                <select value={reportType} onChange={e => setReportType(e.target.value as 'monthly' | 'yearly')} className="form-input">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                {reportType === 'monthly' && (
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-input">
                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                )}
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-input">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleExportCsv} disabled={!reportData.length} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                    <Download size={20} /> Export to CSV
                </button>
                <button onClick={() => setShowPrintPreview(true)} disabled={!reportData.length} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                    <Printer size={20} /> Print Report
                </button>
            </div>
        </div>
        <div className="printable-area">
          <ReportContent />
        </div>
      </div>
      {showPrintPreview && (
          <PrintPreview onClose={() => setShowPrintPreview(false)}>
              <ReportContent />
          </PrintPreview>
      )}
      <style>{`.form-input { padding: 0.5rem 0.75rem; background-color: rgb(249 250 251); border: 1px solid rgb(209 213 219); border-radius: 0.5rem; color: rgb(17 24 39); } .dark .form-input { background-color: rgb(55 65 81); border-color: rgb(75 85 99); color: white; }`}</style>
    </>
  );
};

export default Reports;
