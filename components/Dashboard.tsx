import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Department, Employee } from '../types';
import { Users, Banknote, Percent, Building } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  const totalPayrollUSD = employees.reduce((acc, emp) => acc + emp.baseSalaryUSD, 0);
  
  const departmentData = Object.values(Department).map(dept => {
    const employeesInDept = employees.filter(emp => emp.department === dept);
    const payrollInDept = employeesInDept.reduce((acc, emp) => acc + emp.baseSalaryUSD, 0);
    return {
      name: dept,
      employeeCount: employeesInDept.length,
      payroll: payrollInDept,
    };
  }).filter(d => d.employeeCount > 0);

  const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Welcome back, here's your hotel's payroll overview.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-white" />} 
          title="Total Employees" 
          value={String(totalEmployees)} 
          color="bg-blue-500"
        />
        <StatCard 
          icon={<Banknote className="text-white" />} 
          title="Total Payroll (USD)" 
          value={`$${totalPayrollUSD.toLocaleString()}`} 
          color="bg-green-500"
        />
        <StatCard 
          icon={<Percent className="text-white" />} 
          title="Attendance Rate" 
          value="98.5%" 
          color="bg-yellow-500"
        />
        <StatCard 
          icon={<Building className="text-white" />} 
          title="Departments" 
          value={String(departmentData.length)} 
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Payroll Distribution by Department (USD)</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12, fill: 'currentColor' }} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                  borderColor: '#4b5563', 
                  color: '#fff',
                  borderRadius: '0.5rem'
                }} 
                cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
              />
              <Legend />
              <Bar dataKey="payroll" fill="#3b82f6" name="Payroll (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
