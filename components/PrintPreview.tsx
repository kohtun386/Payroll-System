import React, { ReactNode } from 'react';
import { X, Printer, Info } from 'lucide-react';

interface PrintPreviewProps {
  onClose: () => void;
  children: ReactNode;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ onClose, children }) => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center p-4 z-50 no-print">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Print Preview</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/50 p-2 rounded-md">
                <Info size={16} className="text-blue-500"/>
                <span>For best results, please select 'A4' paper size and 'Portrait' layout in your browser's print dialog.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            {/* A4 aspect ratio container */}
           <div className="w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default PrintPreview;