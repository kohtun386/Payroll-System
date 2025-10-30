import React, { useState, useEffect } from 'react';
import { Employee, Department } from '../types';
import { X } from 'lucide-react';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (employeeData: Omit<Employee, 'id'> | Employee) => void;
  onClose: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: Department.FRONT_OFFICE,
    position: '',
    joinDate: '',
    baseSalaryUSD: 0,
    servicePoints: 0,
    hasSpouse: false,
    children: 0,
    parents: 0,
    ...employee,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.position && formData.joinDate) {
        onSave(formData);
    } else {
        alert('Please fill in all required fields: Name, Position, and Join Date.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium">Full Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label htmlFor="position" className="block mb-2 text-sm font-medium">Position</label>
                <input type="text" name="position" id="position" value={formData.position} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="department" className="block mb-2 text-sm font-medium">Department</label>
                <select name="department" id="department" value={formData.department} onChange={handleChange} className="form-input">
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="joinDate" className="block mb-2 text-sm font-medium">Join Date</label>
                <input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} className="form-input" required />
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="baseSalaryUSD" className="block mb-2 text-sm font-medium">Base Salary (USD)</label>
                <input type="number" name="baseSalaryUSD" id="baseSalaryUSD" value={formData.baseSalaryUSD} onChange={handleChange} className="form-input" min="0" />
              </div>
              <div>
                <label htmlFor="servicePoints" className="block mb-2 text-sm font-medium">Service Points</label>
                <input type="number" name="servicePoints" id="servicePoints" value={formData.servicePoints} onChange={handleChange} className="form-input" min="0" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 border-t pt-4 border-gray-200 dark:border-gray-700">Tax Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="flex items-center">
                    <input type="checkbox" name="hasSpouse" id="hasSpouse" checked={formData.hasSpouse} onChange={handleChange} className="form-checkbox" />
                    <label htmlFor="hasSpouse" className="ml-2 text-sm font-medium">Has Spouse?</label>
                </div>
                <div>
                    <label htmlFor="children" className="block text-sm font-medium">Number of Children</label>
                    <input type="number" name="children" id="children" value={formData.children} onChange={handleChange} className="form-input mt-1" min="0" />
                </div>
                 <div>
                    <label htmlFor="parents" className="block text-sm font-medium">Dependent Parents</label>
                    <input type="number" name="parents" id="parents" value={formData.parents} onChange={handleChange} className="form-input mt-1" min="0" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10">
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                Save Employee
              </button>
            </div>
          </div>
        </form>
      </div>
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background-color: rgb(249 250 251);
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          color: rgb(17 24 39);
        }
        .dark .form-input {
          background-color: rgb(55 65 81);
          border-color: rgb(75 85 99);
          color: white;
        }
        .form-checkbox {
            height: 1.25rem;
            width: 1.25rem;
            border-radius: 0.25rem;
            border-color: rgb(209 213 219);
            color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default EmployeeForm;
