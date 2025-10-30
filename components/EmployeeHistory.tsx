import React, { useState, useMemo } from 'react';
import { Employee, EmployeeHistoryEvent, Department, EventType } from '../types';

interface EmployeeHistoryProps {
  employees: Employee[];
  employeeHistory: EmployeeHistoryEvent[];
}

const EmployeeHistory: React.FC<EmployeeHistoryProps> = ({ employees, employeeHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

  const filteredHistory = useMemo(() => {
    return employeeHistory
      .map(event => ({
        ...event,
        employee: employeeMap.get(event.employeeId),
      }))
      .filter(event => {
        if (!event.employee) return false;
        const employee = event.employee;
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'All' || employee.department === selectedDept;
        const matchesType = selectedType === 'All' || event.type === selectedType;
        return matchesSearch && matchesDept && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [employeeHistory, employeeMap, searchTerm, selectedDept, selectedType]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <header>
        <h2 className="text-3xl font-bold">Global Employee History</h2>
        <p className="text-gray-500 dark:text-gray-400">A comprehensive log of all recorded employee events.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="form-input flex-grow"
        />
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="form-input">
          <option value="All">All Departments</option>
          {Object.values(Department).map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="form-input">
          <option value="All">All Event Types</option>
          {Object.values(EventType).map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Employee</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Event Type</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3 text-right">Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map(event => (
              <tr key={event.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{event.employee?.name}</td>
                <td className="px-6 py-4">{event.employee?.department}</td>
                <td className="px-6 py-4">{event.type}</td>
                <td className="px-6 py-4">{event.description}</td>
                <td className="px-6 py-4 text-right">
                  {event.amount ? `$${event.amount.toLocaleString()}` : '-'}
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No history records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`.form-input { padding: 0.5rem 0.75rem; background-color: rgb(249 250 251); border: 1px solid rgb(209 213 219); border-radius: 0.5rem; color: rgb(17 24 39); } .dark .form-input { background-color: rgb(55 65 81); border-color: rgb(75 85 99); color: white; }`}</style>
    </div>
  );
};

export default EmployeeHistory;
