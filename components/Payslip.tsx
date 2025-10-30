import React, { useState } from 'react';
import { Employee, PayrollEntry, Currency } from '../types';
import { X, Printer } from 'lucide-react';
import PrintPreview from './PrintPreview';

interface PayslipProps {
  employee: Employee;
  payrollEntry: PayrollEntry;
  currency: Currency;
  onClose: () => void;
  hotelName: string;
}

const Payslip: React.FC<PayslipProps> = ({ employee, payrollEntry, currency, onClose, hotelName }) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const PayslipContent = () => (
    <div className="p-8 text-gray-900 bg-white h-full printable-content">
      <header className="text-center mb-8 border-b pb-4 border-gray-200">
        <h1 className="text-3xl font-bold">{hotelName}</h1>
        <h2 className="text-xl font-semibold mt-2">Payslip for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
      </header>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
        <div><strong>Employee Name:</strong> {employee.name}</div>
        <div><strong>Department:</strong> {employee.department}</div>
        <div><strong>Employee ID:</strong> {employee.id}</div>
        <div><strong>Position:</strong> {employee.position}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        {/* Earnings */}
        <div>
          <h3 className="text-lg font-bold text-green-600 border-b-2 border-green-500 pb-1 mb-3">Earnings</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Base Salary:</span> <span>{formatCurrency(payrollEntry.baseSalary)}</span></div>
            <div className="flex justify-between"><span>Service Money:</span> <span>{formatCurrency(payrollEntry.serviceCharge)}</span></div>
            <div className="flex justify-between"><span>Overtime:</span> <span>{formatCurrency(payrollEntry.overtime)}</span></div>
            <hr className="my-2 border-gray-300"/>
            <div className="flex justify-between font-bold"><span>Gross Pay:</span> <span>{formatCurrency(payrollEntry.grossPay)}</span></div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-lg font-bold text-red-600 border-b-2 border-red-500 pb-1 mb-3">Deductions</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Unpaid Leave:</span> <span>({formatCurrency(payrollEntry.unpaidLeaveDeduction)})</span></div>
            <div className="flex justify-between"><span>Income Tax:</span> <span>({formatCurrency(payrollEntry.tax)})</span></div>
            <div className="flex justify-between"><span>Social Security (SSB):</span> <span>({formatCurrency(payrollEntry.ssb)})</span></div>
            {payrollEntry.manualDeductions > 0 && (
                <div className="flex justify-between">
                    <span>Manual Deduction ({payrollEntry.manualDeductionReason || 'N/A'}):</span>
                    <span>({formatCurrency(payrollEntry.manualDeductions)})</span>
                </div>
            )}
            <hr className="my-2 border-gray-300"/>
            <div className="flex justify-between font-bold"><span>Total Deductions:</span> <span>({formatCurrency(payrollEntry.totalDeductions)})</span></div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t-2 border-gray-300 pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Net Salary:</span>
          <span className="text-green-700">{formatCurrency(payrollEntry.netPay)}</span>
        </div>
      </div>
       <footer className="text-center mt-8 text-xs text-gray-500">
        This is a computer-generated payslip and does not require a signature.
      </footer>
    </div>
  );
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 no-print">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Payslip Preview</h2>
            <div>
              <button
                onClick={() => setShowPrintPreview(true)}
                className="p-2 mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Print"
              >
                <Printer size={20} />
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
          <main className="overflow-y-auto printable-area">
             <PayslipContent/>
          </main>
        </div>
      </div>
      {showPrintPreview && (
          <PrintPreview onClose={() => setShowPrintPreview(false)}>
              <PayslipContent />
          </PrintPreview>
      )}
    </>
  );
};

export default Payslip;