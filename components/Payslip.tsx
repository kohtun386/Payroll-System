import React, { useState } from 'react';
import { Employee, PayrollEntry, Currency } from '../types';
import { X, Printer } from 'lucide-react';
import PrintPreview from './PrintPreview';
import PayslipContent from './PayslipContent';

interface PayslipProps {
  employee: Employee;
  payrollEntry: PayrollEntry;
  currency: Currency;
  onClose: () => void;
  hotelName: string;
}

const Payslip: React.FC<PayslipProps> = ({ employee, payrollEntry, currency, onClose, hotelName }) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const contentToRender = <PayslipContent 
      employee={employee} 
      payrollEntry={payrollEntry} 
      currency={currency} 
      hotelName={hotelName}
    />;

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
             {contentToRender}
          </main>
        </div>
      </div>
      {showPrintPreview && (
          <PrintPreview onClose={() => setShowPrintPreview(false)}>
              {contentToRender}
          </PrintPreview>
      )}
    </>
  );
};

export default Payslip;
