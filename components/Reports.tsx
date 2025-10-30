import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { HistoricalPayrollRun, Employee, Department } from '../types';
import { Banknote, FileText, Printer, Users, Download, TrendingUp, BarChart2 } from 'lucide-react';
import PrintPreview from './PrintPreview';

interface ReportsProps {
  historicalPayroll: HistoricalPayrollRun[];
  employees: Employee[]; // Current employees for CSV fallback
  theme: 'light' | 'dark';
}

const Reports: React.FC<ReportsProps> = ({ historicalPayroll, employees, theme }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'trends'>('summary');
  
  // State for Summary tab
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

  const selectedPeriodData = useMemo(() => {
    return historicalPayroll.find(p => p.year === year && p.month === month) || null;
  }, [year, month, historicalPayroll]);

  const { kpis, departmentData } = useMemo(() => {
    if (!selectedPeriodData) return { kpis: null, departmentData: [] };

    const { payrollData, employees: snapshotEmployees } = selectedPeriodData;

    const totalGross = payrollData.reduce((sum, item) => sum + item.grossPay, 0);
    const totalDeductions = payrollData.reduce((sum, item) => sum + item.totalDeductions, 0);
    const totalNet = payrollData.reduce((sum, item) => sum + item.netPay, 0);

    const employeeMap = new Map(snapshotEmployees.map(e => [e.id, e]));

    const deptData = Object.values(Department).map(dept => {
        const payrollInDept = payrollData
            .filter(entry => employeeMap.get(entry.employeeId)?.department === dept)
            .reduce((sum, item) => sum + item.netPay, 0);
        return { name: dept, payroll: payrollInDept };
    }).filter(d => d.payroll > 0);

    return {
        kpis: {
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: snapshotEmployees.length,
        },
        departmentData: deptData,
    };
  }, [selectedPeriodData]);

  const trendData = useMemo(() => {
    const sortedHistory = [...historicalPayroll].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    return sortedHistory.map(run => {
        const totalGross = run.payrollData.reduce((sum, item) => sum + item.grossPay, 0);
        const totalDeductions = run.payrollData.reduce((sum, item) => sum + item.totalDeductions, 0);
        const totalNet = run.payrollData.reduce((sum, item) => sum + item.netPay, 0);
        
        const depts = run.employees.reduce((acc, emp) => {
            const payroll = run.payrollData.find(p => p.employeeId === emp.id);
            if(payroll) {
                acc[emp.department] = (acc[emp.department] || 0) + payroll.netPay;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            name: `${months[run.month].slice(0, 3)} ${run.year}`,
            'Gross Pay': totalGross,
            'Net Pay': totalNet,
            'Deductions': totalDeductions,
            'Employee Count': run.employees.length,
            ...depts
        };
    });
  }, [historicalPayroll]);
  
  const handleExportCsv = () => {
    if (!selectedPeriodData) return;

    const { payrollData, employees: snapshotEmployees } = selectedPeriodData;
    const employeeMap = new Map(snapshotEmployees.map(e => [e.id, e]));
    const headers = ['Employee ID', 'Name', 'Department', 'Position', 'Gross Pay (MMK)', 'Total Deductions (MMK)', 'Net Pay (MMK)', 'Manual Deduction Reason'];
    
    const rows = payrollData.map(entry => {
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
    const fileName = `Payroll_Report_${year}_${months[month]}.csv`;
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

  const tooltipStyle = theme === 'dark'
    ? { backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', color: '#fff', borderRadius: '0.5rem' }
    : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#e5e7eb', color: '#000', borderRadius: '0.5rem' };


  const SummaryContent = () => (
    <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-gray-900 printable-content">
      <header className="print:text-black">
        <h2 className="text-3xl font-bold">Payroll Report</h2>
        <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">
            Report for {months[month]}, {year}
        </p>
      </header>
       {!selectedPeriodData || !kpis ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No Payroll Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please finalize the payroll for the selected period to generate a report.
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
                            <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} />
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
  
  const departmentColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


  const TrendsContent = () => (
     <div className="p-6 md:p-8 space-y-8">
       <header>
        <h2 className="text-3xl font-bold">Payroll Trends</h2>
        <p className="text-gray-500 dark:text-gray-400">
            Visualize historical payroll and headcount data over time.
        </p>
      </header>
       {trendData.length < 2 ? (
         <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
           <TrendingUp size={48} className="mx-auto text-gray-400" />
           <h3 className="mt-2 text-lg font-medium">Insufficient Data for Trends</h3>
           <p className="mt-1 text-sm text-gray-500">
             Finalize payroll for at least two different months to see trend analysis.
           </p>
         </div>
       ) : (
        <div className="space-y-8">
            {/* Chart 1: Payroll Cost */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Total Payroll Cost Over Time (MMK)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Area type="monotone" dataKey="Gross Pay" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                        <Area type="monotone" dataKey="Net Pay" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6}/>
                        <Area type="monotone" dataKey="Deductions" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
             {/* Chart 2: Headcount */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Headcount Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Line type="monotone" dataKey="Employee Count" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             {/* Chart 3: Departmental Costs */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Departmental Payroll Comparison (Net Pay in MMK)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        {Object.values(Department).map((dept, index) => (
                             <Bar key={dept} dataKey={dept} stackId="a" fill={departmentColors[index % departmentColors.length]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
       )}
    </div>
  );

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap no-print">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 font-semibold ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><BarChart2 size={16} className="inline-block mr-2"/>Period Summary</button>
                <button onClick={() => setActiveTab('trends')} className={`px-4 py-2 font-semibold ${activeTab === 'trends' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><TrendingUp size={16} className="inline-block mr-2"/>Payroll Trends</button>
            </div>
            {activeTab === 'summary' && (
              <div className="flex items-center gap-4">
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-input">
                      {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-input">
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                      <button onClick={handleExportCsv} disabled={!selectedPeriodData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                          <Download size={20} /> Export CSV
                      </button>
                      <button onClick={() => setShowPrintPreview(true)} disabled={!selectedPeriodData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                          <Printer size={20} /> Print Report
                      </button>
                  </div>
              </div>
            )}
        </div>
        
        {activeTab === 'summary' && <div className="printable-area"><SummaryContent /></div>}
        {activeTab === 'trends' && <TrendsContent />}

      </div>
      {showPrintPreview && (
          <PrintPreview onClose={() => setShowPrintPreview(false)}>
              <SummaryContent />
          </PrintPreview>
      )}
      <style>{`.form-input { padding: 0.5rem 0.75rem; background-color: rgb(249 250 251); border: 1px solid rgb(209 213 219); border-radius: 0.5rem; color: rgb(17 24 39); } .dark .form-input { background-color: rgb(55 65 81); border-color: rgb(75 85 99); color: white; }`}</style>
    </>
  );
};

export default Reports;