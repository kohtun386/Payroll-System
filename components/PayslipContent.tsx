import React from 'react';
import { Employee, PayrollEntry, Currency } from '../types';

interface PayslipContentProps {
  employee: Employee;
  payrollEntry: PayrollEntry;
  currency: Currency;
  hotelName: string;
  isCompact?: boolean;
}

const PayslipContent: React.FC<PayslipContentProps> = ({ employee, payrollEntry, currency, hotelName, isCompact = false }) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const textSize = isCompact ? 'text-xs' : 'text-sm';
  const titleSize = isCompact ? 'text-base' : 'text-xl';
  const headerSize = isCompact ? 'text-lg' : 'text-3xl';
  const padding = isCompact ? 'p-4' : 'p-8';

  return (
    <div className={`${padding} text-gray-900 bg-white h-full printable-content`}>
      <header className="text-center mb-4 border-b pb-2 border-gray-200">
        <h1 className={`${headerSize} font-bold`}>{hotelName}</h1>
        <h2 className={`${titleSize} font-semibold mt-1`}>Payslip for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
      </header>

      <div className={`grid grid-cols-2 gap-x-4 gap-y-2 mb-4 ${textSize}`}>
        <div><strong>Employee:</strong> {employee.name}</div>
        <div><strong>Department:</strong> {employee.department}</div>
        <div><strong>ID:</strong> {employee.id}</div>
        <div><strong>Position:</strong> {employee.position}</div>
      </div>

      <div className={`grid grid-cols-2 gap-x-4 ${textSize}`}>
        {/* Earnings */}
        <div>
          <h3 className="font-bold text-green-600 border-b border-green-500 pb-1 mb-2">Earnings</h3>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Base Salary:</span> <span>{formatCurrency(payrollEntry.baseSalary)}</span></div>
            <div className="flex justify-between"><span>Service Money:</span> <span>{formatCurrency(payrollEntry.serviceCharge)}</span></div>
            <div className="flex justify-between"><span>Overtime:</span> <span>{formatCurrency(payrollEntry.overtime)}</span></div>
            <hr className="my-1 border-gray-300"/>
            <div className="flex justify-between font-bold"><span>Gross Pay:</span> <span>{formatCurrency(payrollEntry.grossPay)}</span></div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="font-bold text-red-600 border-b border-red-500 pb-1 mb-2">Deductions</h3>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Unpaid Leave:</span> <span>({formatCurrency(payrollEntry.unpaidLeaveDeduction)})</span></div>
            <div className="flex justify-between"><span>Income Tax:</span> <span>({formatCurrency(payrollEntry.tax)})</span></div>
            <div className="flex justify-between"><span>SSB:</span> <span>({formatCurrency(payrollEntry.ssb)})</span></div>
            {payrollEntry.manualDeductions > 0 && (
                <div className="flex justify-between">
                    <span>{payrollEntry.manualDeductionReason || 'Manual Deduction'}:</span>
                    <span>({formatCurrency(payrollEntry.manualDeductions)})</span>
                </div>
            )}
            <hr className="my-1 border-gray-300"/>
            <div className="flex justify-between font-bold"><span>Total Deductions:</span> <span>({formatCurrency(payrollEntry.totalDeductions)})</span></div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-gray-300 pt-2">
        <div className={`flex justify-between items-center font-bold ${isCompact ? 'text-base' : 'text-xl'}`}>
          <span>Net Salary:</span>
          <span className="text-green-700">{formatCurrency(payrollEntry.netPay)}</span>
        </div>
      </div>
       <footer className={`text-center mt-4 text-gray-500 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
        This is a computer-generated payslip.
      </footer>
    </div>
  );
}

export default PayslipContent;
