import React, { useState, useRef } from 'react';
import { Employee, Department, EmployeeHistoryEvent } from '../types';
import { Plus, Edit, Trash2, Upload, History } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import EmployeeHistoryModal from './EmployeeHistoryModal';

interface EmployeesProps {
  employees: Employee[];
  employeeHistory: EmployeeHistoryEvent[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onAddHistoryEvent: (event: Omit<EmployeeHistoryEvent, 'id'>) => void;
  onBulkAddEmployees: (employees: Omit<Employee, 'id'>[]) => void;
}

const Employees: React.FC<EmployeesProps> = ({ 
    employees, 
    employeeHistory,
    onAddEmployee, 
    onUpdateEmployee, 
    onDeleteEmployee, 
    onAddHistoryEvent,
    onBulkAddEmployees,
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFormModal = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setIsFormModalOpen(true);
  };
  
  const handleOpenHistoryModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsHistoryModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedEmployee(null);
    setIsFormModalOpen(false);
    setIsHistoryModalOpen(false);
  };

  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'> | Employee) => {
    if ('id' in employeeData) {
      onUpdateEmployee(employeeData);
    } else {
      onAddEmployee(employeeData);
    }
    handleCloseModals();
  };

  const handleDelete = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      onDeleteEmployee(employeeId);
    }
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const requiredHeaders = ['name', 'department', 'position', 'joinDate', 'baseSalaryUSD', 'servicePoints', 'hasSpouse', 'children', 'parents'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert(`CSV file is missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }
      
      const newEmployees: Omit<Employee, 'id'>[] = [];
      for(let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const empData: any = {};
        headers.forEach((header, index) => {
            const value = values[index].trim();
            // Convert to correct types
            if (['baseSalaryUSD', 'servicePoints', 'children', 'parents'].includes(header)) {
                empData[header] = Number(value);
            } else if (header === 'hasSpouse') {
                empData[header] = value.toLowerCase() === 'true';
            } else {
                empData[header] = value;
            }
        });
        newEmployees.push(empData);
      }
      if(window.confirm(`Successfully parsed ${newEmployees.length} employees. Do you want to add them to the system?`)) {
        onBulkAddEmployees(newEmployees);
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const employeesByDepartment = employees.reduce((acc, emp) => {
    (acc[emp.department] = acc[emp.department] || []).push(emp);
    return acc;
  }, {} as Record<Department, Employee[]>);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Employee Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Add, edit, or remove employee records and view history.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative" title="Required CSV headers: name,department,position,joinDate,baseSalaryUSD,servicePoints,hasSpouse,children,parents">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <Upload size={20} />
                    Import from CSV
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
            </div>
            <button
                onClick={() => handleOpenFormModal()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <Plus size={20} />
                Add Employee
            </button>
        </div>
      </header>

      <div className="space-y-8">
        {Object.entries(employeesByDepartment).sort(([deptA], [deptB]) => deptA.localeCompare(deptB)).map(([department, emps]) => (
          <div key={department} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{department}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Position</th>
                    <th scope="col" className="px-6 py-3 text-right">Base Salary (USD)</th>
                    <th scope="col" className="px-6 py-3 text-center">Service Points</th>
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emps.map(emp => (
                    <tr key={emp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{emp.name}</td>
                      <td className="px-6 py-4">{emp.position}</td>
                      <td className="px-6 py-4 text-right">${emp.baseSalaryUSD.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">{emp.servicePoints}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-4">
                           <button onClick={() => handleOpenHistoryModal(emp)} className="text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-400" aria-label={`View history for ${emp.name}`}>
                            <History size={18} />
                          </button>
                          <button onClick={() => handleOpenFormModal(emp)} className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400" aria-label={`Edit ${emp.name}`}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400" aria-label={`Delete ${emp.name}`}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {isFormModalOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleSaveEmployee}
          onClose={handleCloseModals}
        />
      )}
      
      {isHistoryModalOpen && selectedEmployee && (
        <EmployeeHistoryModal
            employee={selectedEmployee}
            history={employeeHistory.filter(e => e.employeeId === selectedEmployee.id)}
            onAddEvent={onAddHistoryEvent}
            onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default Employees;
