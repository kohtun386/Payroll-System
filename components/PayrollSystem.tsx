import React, { useState, useMemo } from 'react';
import { CURRENCIES, EXCHANGE_RATES } from '../constants';
import { Employee, PayrollEntry, Currency, EmployeeAttendance, HistoricalPayrollRun } from '../types';
import Payslip from './Payslip';
import { Lock, Printer } from 'lucide-react';
import MultiPayslipPrint from './MultiPayslipPrint';

const calculateMyanmarTax = (annualGrossSalaryMMK: number, employee: Employee, annualSSB: number): number => {
    if (annualGrossSalaryMMK <= 0) return 0;

    const personalAllowance = Math.min(annualGrossSalaryMMK * 0.2, 10_000_000);
    const spouseAllowance = employee.hasSpouse ? 1_000_000 : 0;
    const childAllowance = employee.children * 500_000;
    const parentAllowance = employee.parents * 1_000_000;
    const totalAllowances = personalAllowance + spouseAllowance + childAllowance + parentAllowance + annualSSB;

    let taxableIncome = annualGrossSalaryMMK - totalAllowances;
    if (taxableIncome <= 0) return 0;
    
    let tax = 0;
    const brackets = [
        { limit: 2_000_000, rate: 0 },
        { limit: 3_000_000, rate: 0.05 }, // 2M to 5M
        { limit: 5_000_000, rate: 0.10 }, // 5M to 10M
        { limit: 10_000_000, rate: 0.15 },// 10M to 20M
        { limit: 10_000_000, rate: 0.20 },// 20M to 30M
        { limit: Infinity, rate: 0.25 },  // Above 30M
    ];

    let incomeLeft = taxableIncome;

    for (const bracket of brackets) {
        const taxableAtThisRate = Math.min(incomeLeft, bracket.limit);
        tax += taxableAtThisRate * bracket.rate;
        incomeLeft -= taxableAtThisRate;
        if (incomeLeft <= 0) break;
    }
    
    return tax / 12;
};

interface PayrollSystemProps {
  employees: Employee[];
  attendanceData: EmployeeAttendance[];
  payrollData: PayrollEntry[];
  onPayrollCalculated: (data: PayrollEntry[]) => void;
  hotelName: string;
  historicalPayroll: HistoricalPayrollRun[];
  onFinalizePayroll: () => void;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
}

const PayrollSystem: React.FC<PayrollSystemProps> = ({ 
    employees, 
    attendanceData, 
    payrollData, 
    onPayrollCalculated, 
    hotelName,
    historicalPayroll,
    onFinalizePayroll,
    selectedCurrency,
    setSelectedCurrency
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [showMultiPrint, setShowMultiPrint] = useState(false);
  const [serviceMoneyPerPoint, setServiceMoneyPerPoint] = useState<number>(50000);
  const [manualDeductions, setManualDeductions] = useState<Record<string, { amount: number; reason: string }>>({});

  const isCurrentMonthFinalized = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    return historicalPayroll.some(p => p.year === year && p.month === month);
  }, [historicalPayroll]);

  const handleDeductionChange = (employeeId: string, value: string, field: 'amount' | 'reason') => {
    setManualDeductions(prev => ({
        ...prev,
        [employeeId]: {
            ...(prev[employeeId] || { amount: 0, reason: '' }),
            [field]: field === 'amount' ? Number(value) : value,
        },
    }));
    // When deductions change, payroll becomes stale.
    onPayrollCalculated([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePayroll = () => {
    if (isCurrentMonthFinalized) {
      if (!window.confirm("This month's payroll has already been finalized. Recalculating will overwrite the saved data when you finalize again. Do you want to continue?")) {
        return;
      }
    }
    const exchangeRateToMMK = EXCHANGE_RATES['MMK'];
    
    const daysInMonth = attendanceData[0]?.dailyStatuses.length || 30;

    const data = employees.map(emp => {
      const attendance = attendanceData.find(a => a.employee.id === emp.id);
      const unpaidLeaveDays = attendance ? (attendance.summary.LW || 0) + (attendance.summary.A || 0) : 0;

      // --- Earnings ---
      const baseSalaryMMK = emp.baseSalaryUSD * exchangeRateToMMK;
      const serviceChargeMMK = emp.servicePoints * (EXCHANGE_RATES[selectedCurrency.code] === EXCHANGE_RATES['MMK'] ? serviceMoneyPerPoint : serviceMoneyPerPoint / EXCHANGE_RATES[selectedCurrency.code] * exchangeRateToMMK);
      const overtimeMMK = Math.random() > 0.5 ? baseSalaryMMK * 0.05 : 0; // Using mock overtime for now
      const grossEarningsMMK = baseSalaryMMK + serviceChargeMMK + overtimeMMK;

      // --- Deductions ---
      const dailyRateMMK = baseSalaryMMK / daysInMonth;
      const unpaidLeaveDeductionMMK = dailyRateMMK * unpaidLeaveDays;
      const ssbMMK = baseSalaryMMK * 0.02;
      
      const employeeDeduction = manualDeductions[emp.id] || { amount: 0, reason: '' };
      const manualDeductionMMK = (employeeDeduction.amount / EXCHANGE_RATES[selectedCurrency.code]) * exchangeRateToMMK;

      // --- Tax Calculation ---
      // Taxable income is based on actual earnings for the period.
      const taxableMonthlyIncome = (baseSalaryMMK - unpaidLeaveDeductionMMK) + serviceChargeMMK + overtimeMMK;
      const annualGrossForTax = taxableMonthlyIncome < 0 ? 0 : taxableMonthlyIncome * 12;
      const annualSSB = ssbMMK * 12;
      const taxMMK = calculateMyanmarTax(annualGrossForTax, emp, annualSSB);
      
      // --- Final Calculation ---
      const totalDeductionsMMK = taxMMK + ssbMMK + unpaidLeaveDeductionMMK + manualDeductionMMK;
      const netPayMMK = grossEarningsMMK - totalDeductionsMMK;
      
      return {
        employeeId: emp.id,
        baseSalary: baseSalaryMMK,
        serviceCharge: serviceChargeMMK,
        overtime: overtimeMMK,
        unpaidLeaveDeduction: unpaidLeaveDeductionMMK,
        grossPay: grossEarningsMMK,
        tax: taxMMK,
        ssb: ssbMMK,
        manualDeductions: manualDeductionMMK,
        manualDeductionReason: employeeDeduction.reason,
        totalDeductions: totalDeductionsMMK,
        netPay: netPayMMK,
      };
    });
    onPayrollCalculated(data);
  };
  
  const convertToSelectedCurrency = (amountMMK: number) => {
    const exchangeRateToMMK = EXCHANGE_RATES['MMK'];
    const exchangeRateToSelected = EXCHANGE_RATES[selectedCurrency.code];
    return (amountMMK / exchangeRateToMMK) * exchangeRateToSelected;
  };

  const handleGeneratePayslip = (employee: Employee) => {
    if (payrollData.length === 0) {
        alert("Please calculate payroll first.");
        return;
    }
    setSelectedEmployee(employee);
    setShowPayslip(true);
  };

  const employeePayrollMap = useMemo(() => {
    return payrollData.reduce((acc, entry) => {
      acc[entry.employeeId] = entry;
      return acc;
    }, {} as Record<string, PayrollEntry>);
  }, [payrollData]);

  return (
    <div className="p-6 md:p-8 space-y-6">
       <header>
        <h2 className="text-3xl font-bold">Payroll Management</h2>
        <p className="text-gray-500 dark:text-gray-400">Calculate and manage employee payroll based on attendance and Myanmar tax law.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <label htmlFor="currency-select" className="font-semibold whitespace-nowrap">Display Currency:</label>
          <select
            id="currency-select"
            value={selectedCurrency.code}
            onChange={(e) => {
                const newCurrency = CURRENCIES.find(c => c.code === e.target.value);
                if (newCurrency) {
                    setSelectedCurrency(newCurrency);
                }
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
            <label htmlFor="service-money" className="font-semibold whitespace-nowrap">Service Money / Point ({selectedCurrency.symbol}):</label>
            <input
                type="number"
                id="service-money"
                value={serviceMoneyPerPoint}
                onChange={(e) => setServiceMoneyPerPoint(Number(e.target.value) || 0)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="e.g. 50000"
            />
        </div>
        <div className="flex items-center gap-2">
            <button
            onClick={calculatePayroll}
            disabled={!attendanceData.length}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
            {attendanceData.length ? 'Calculate Payroll' : 'Loading Attendance...'}
            </button>
             <button
                onClick={onFinalizePayroll}
                disabled={payrollData.length === 0}
                className={`flex items-center gap-2 w-full md:w-auto font-bold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed ${
                    isCurrentMonthFinalized 
                    ? 'bg-green-600 text-white disabled:bg-green-400' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white disabled:bg-gray-400'
                }`}
                title={isCurrentMonthFinalized ? "This month's payroll is already finalized. Clicking again will overwrite it." : "Saves a permanent snapshot of this payroll run for historical reporting."}
                >
                <Lock size={16} />
                {isCurrentMonthFinalized ? 'Finalized' : 'Finalize & Save'}
            </button>
        </div>
      </div>
      
       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-end">
            <button
                onClick={() => setShowMultiPrint(true)}
                disabled={payrollData.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Print all payslips"
            >
                <Printer size={16} />
                Print All Payslips
            </button>
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Sr</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Name</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Department</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right">Base Salary</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right">Gross Pay</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right text-red-500">Unpaid Leave</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right">SSB (2%)</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right">Income Tax</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-center">Manual Deduction</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-center">Reason</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap text-right font-bold">Net Salary</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => {
              const entry = employeePayrollMap[emp.id];
              return (
                <tr key={emp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                   <td className="px-4 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{emp.name}</td>
                  <td className="px-6 py-4">{emp.department}</td>
                  <td className="px-6 py-4 text-right">{entry ? formatCurrency(convertToSelectedCurrency(entry.baseSalary)) : '-'}</td>
                  <td className="px-6 py-4 text-right">{entry ? formatCurrency(convertToSelectedCurrency(entry.grossPay)) : '-'}</td>
                  <td className="px-6 py-4 text-right text-red-500">{entry ? `(${formatCurrency(convertToSelectedCurrency(entry.unpaidLeaveDeduction))})` : '-'}</td>
                  <td className="px-6 py-4 text-right">{entry ? formatCurrency(convertToSelectedCurrency(entry.ssb)) : '-'}</td>
                  <td className="px-6 py-4 text-right">{entry ? formatCurrency(convertToSelectedCurrency(entry.tax)) : '-'}</td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      aria-label={`Manual deduction for ${emp.name}`}
                      value={manualDeductions[emp.id]?.amount || ''}
                      onChange={(e) => handleDeductionChange(emp.id, e.target.value, 'amount')}
                      placeholder="0"
                      className="w-28 p-2 text-right bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      aria-label={`Reason for manual deduction for ${emp.name}`}
                      value={manualDeductions[emp.id]?.reason || ''}
                      onChange={(e) => handleDeductionChange(emp.id, e.target.value, 'reason')}
                      placeholder="e.g., Penalty fee"
                      className="w-36 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">{entry ? formatCurrency(convertToSelectedCurrency(entry.netPay)) : '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleGeneratePayslip(emp)} disabled={!entry} className="font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">Payslip</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {showPayslip && selectedEmployee && (
        <Payslip
          employee={selectedEmployee}
          payrollEntry={{
            ...employeePayrollMap[selectedEmployee.id],
            baseSalary: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].baseSalary),
            serviceCharge: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].serviceCharge),
            overtime: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].overtime),
            unpaidLeaveDeduction: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].unpaidLeaveDeduction),
            grossPay: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].grossPay),
            tax: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].tax),
            ssb: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].ssb),
            manualDeductions: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].manualDeductions),
            totalDeductions: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].totalDeductions),
            netPay: convertToSelectedCurrency(employeePayrollMap[selectedEmployee.id].netPay),
          }}
          currency={selectedCurrency}
          onClose={() => setShowPayslip(false)}
          hotelName={hotelName}
        />
      )}

       {showMultiPrint && (
        <MultiPayslipPrint
          employees={employees}
          payrollData={payrollData.map(p => ({
              ...p,
              baseSalary: convertToSelectedCurrency(p.baseSalary),
              serviceCharge: convertToSelectedCurrency(p.serviceCharge),
              overtime: convertToSelectedCurrency(p.overtime),
              unpaidLeaveDeduction: convertToSelectedCurrency(p.unpaidLeaveDeduction),
              grossPay: convertToSelectedCurrency(p.grossPay),
              tax: convertToSelectedCurrency(p.tax),
              ssb: convertToSelectedCurrency(p.ssb),
              manualDeductions: convertToSelectedCurrency(p.manualDeductions),
              totalDeductions: convertToSelectedCurrency(p.totalDeductions),
              netPay: convertToSelectedCurrency(p.netPay),
          }))}
          currency={selectedCurrency}
          onClose={() => setShowMultiPrint(false)}
          hotelName={hotelName}
        />
       )}
    </div>
  );
};

export default PayrollSystem;
