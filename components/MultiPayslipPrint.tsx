import React, { useState, useMemo } from 'react';
import { Employee, PayrollEntry, Currency, Department } from '../types';
import { X, Printer, Info } from 'lucide-react';
import PayslipContent from './PayslipContent';

interface MultiPayslipPrintProps {
  employees: Employee[];
  payrollData: PayrollEntry[];
  currency: Currency;
  onClose: () => void;
  hotelName: string;
}

const MultiPayslipPrint: React.FC<MultiPayslipPrintProps> = ({ employees, payrollData, currency, onClose, hotelName }) => {
  const [layout, setLayout] = useState<2 | 4>(4);
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

  const departments = useMemo(() => {
    const depts = new Set<Department>();
    payrollData.forEach(p => {
        const emp = employeeMap.get(p.employeeId);
        if (emp) {
            depts.add(emp.department);
        }
    });
    return ['All Departments', ...Array.from(depts).sort()];
  }, [payrollData, employeeMap]);

  const filteredPayrollData = useMemo(() => {
    if (selectedDept === 'All Departments') {
        return payrollData;
    }
    return payrollData.filter(p => {
        const emp = employeeMap.get(p.employeeId);
        return emp?.department === selectedDept;
    });
  }, [payrollData, selectedDept, employeeMap]);


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center p-4 z-50 no-print">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Multi-Payslip Print Preview</h2>
             <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Info size={16} className="text-blue-500"/>
                <span>Printing {filteredPayrollData.length} of {payrollData.length} total payslips.</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="dept-select" className="text-sm font-medium">Department:</label>
              <select
                id="dept-select"
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="layout-select" className="text-sm font-medium">Layout:</label>
              <select
                id="layout-select"
                value={layout}
                onChange={e => setLayout(Number(e.target.value) as 2 | 4)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={2}>2 per page</option>
                <option value={4}>4 per page</option>
              </select>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </header>
        <main className="overflow-y-auto flex-grow p-4 bg-gray-200 dark:bg-gray-900">
           <div className="w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden printable-content">
             <div className={`grid ${layout === 4 ? 'grid-cols-2' : 'grid-cols-1'} h-full`}>
                {filteredPayrollData.map(entry => {
                    const employee = employeeMap.get(entry.employeeId);
                    if (!employee) return null;
                    return (
                        <div key={entry.employeeId} className={`border border-dashed border-gray-300 ${layout === 4 ? 'h-1/2' : ''}`}>
                            <PayslipContent
                                employee={employee}
                                payrollEntry={entry}
                                currency={currency}
                                hotelName={hotelName}
                                isCompact={true}
                            />
                        </div>
                    );
                })}
             </div>
           </div>
        </main>
      </div>
      <style>{`
        @media print {
            .no-print { display: none !important; }
            body { 
                background-color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
             }
            main {
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
            }
            .printable-content {
                width: 100% !important;
                height: 100% !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        }
        @page {
            size: A4 portrait;
            margin: 0;
        }
      `}</style>
    </div>
  );
};

export default MultiPayslipPrint;