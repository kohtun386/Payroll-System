import React from 'react';
import { ATTENDANCE_STATUSES } from '../constants';
import { EmployeeAttendance } from '../types';

interface AttendanceProps {
  attendanceData: EmployeeAttendance[];
  onAttendanceChange: (employeeId: string, dayIndex: number, newStatus: string) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ attendanceData, onAttendanceChange }) => {
  const today = new Date();
  const daysInMonth = attendanceData[0]?.dailyStatuses.length || 30;
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const statusKeys = Object.keys(ATTENDANCE_STATUSES);

  const Legend = () => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {Object.entries(ATTENDANCE_STATUSES).map(([key, { label }]) => (
            <div key={key} className="flex items-center gap-2">
                <div className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${ATTENDANCE_STATUSES[key].color.split(' ')[0]}`}>{key}</div>
                <span>{label}</span>
            </div>
        ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Editable Time Sheet for {today.toLocaleString('default', { month: 'long' })}</h2>
          <p className="text-gray-500 dark:text-gray-400">Click on any day to change an employee's attendance status.</p>
        </div>
        <Legend />
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-2 py-3 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-700 z-20">Sr</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap sticky left-8 bg-gray-50 dark:bg-gray-700 z-20">Name</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Department</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} scope="col" className="px-2 py-3 text-center w-12">{i + 1}</th>
              ))}
              <th scope="col" className="px-2 py-3 text-center" title="Present Day">P</th>
              <th scope="col" className="px-2 py-3 text-center" title="Off Day">O</th>
              <th scope="col" className="px-2 py-3 text-center" title="Leave With Pay">L</th>
              <th scope="col" className="px-2 py-3 text-center" title="Leave Without Pay">LW</th>
              <th scope="col" className="px-2 py-3 text-center" title="Sick Leave">S</th>
              <th scope="col" className="px-2 py-3 text-center" title="Absent">A</th>
              <th scope="col" className="px-2 py-3 text-center font-bold" title="Total Paid Days">Total Pay Day</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((att, index) => (
              <tr key={att.employee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">{index + 1}</td>
                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky left-8 bg-white dark:bg-gray-800 z-10">{att.employee.name}</td>
                <td className="px-4 py-2">{att.employee.department}</td>
                {att.dailyStatuses.map((status, idx) => {
                  const config = ATTENDANCE_STATUSES[status];
                  return (
                    <td key={idx} className="px-1 py-1 text-center">
                      <select
                        value={status}
                        onChange={(e) => onAttendanceChange(att.employee.id, idx, e.target.value)}
                        className={`w-10 h-8 text-center text-xs font-bold rounded border-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 ${config ? config.color : ''}`}
                        aria-label={`Attendance for ${att.employee.name} on day ${idx + 1}`}
                      >
                        {statusKeys.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </td>
                  )
                })}
                <td className="px-2 py-3 text-center font-bold">{att.summary.P || 0}</td>
                <td className="px-2 py-3 text-center font-bold">{att.summary.O || 0}</td>
                <td className="px-2 py-3 text-center font-bold">{att.summary.L || 0}</td>
                <td className="px-2 py-3 text-center font-bold text-red-500">{att.summary.LW || 0}</td>
                <td className="px-2 py-3 text-center font-bold">{att.summary.S || 0}</td>
                <td className="px-2 py-3 text-center font-bold text-red-500">{att.summary.A || 0}</td>
                <td className="px-2 py-3 text-center font-bold text-green-600 dark:text-green-400">{att.summary.totalPaidDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
