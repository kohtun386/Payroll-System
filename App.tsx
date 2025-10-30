import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PayrollSystem from './components/PayrollSystem';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Employees from './components/Employees';
import EmployeeHistory from './components/EmployeeHistory'; // New Import
import { LayoutDashboard, Banknote, Building2, CalendarCheck, FileText, Cog, Users, History, Sun, Moon } from 'lucide-react'; // Added History, Sun, Moon icons
import { MOCK_EMPLOYEES, ATTENDANCE_STATUSES, CURRENCIES } from './constants';
import { EmployeeAttendance, AttendanceSummary, PayrollEntry, Employee, EmployeeHistoryEvent, EventType, HistoricalPayrollRun, Currency } from './types';

type View = 'dashboard' | 'payroll' | 'attendance' | 'reports' | 'settings' | 'employees' | 'history'; // Added 'history' view
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [attendanceData, setAttendanceData] = useState<EmployeeAttendance[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
  const [hotelName, setHotelName] = useState(() => {
    return localStorage.getItem('hotelName') || 'Hotel Empire';
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedEmployees = localStorage.getItem('employees');
    return savedEmployees ? JSON.parse(savedEmployees) : MOCK_EMPLOYEES;
  });
  const [employeeHistory, setEmployeeHistory] = useState<EmployeeHistoryEvent[]>(() => {
    const savedHistory = localStorage.getItem('employeeHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [historicalPayroll, setHistoricalPayroll] = useState<HistoricalPayrollRun[]>(() => {
    const savedHistory = localStorage.getItem('historicalPayroll');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const savedCurrencyCode = localStorage.getItem('selectedCurrency');
    return CURRENCIES.find(c => c.code === savedCurrencyCode) || CURRENCIES[1]; // Default to MMK
  });
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('hotelName', hotelName);
  }, [hotelName]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  
  useEffect(() => {
    localStorage.setItem('employeeHistory', JSON.stringify(employeeHistory));
  }, [employeeHistory]);

  useEffect(() => {
    localStorage.setItem('historicalPayroll', JSON.stringify(historicalPayroll));
  }, [historicalPayroll]);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency.code);
  }, [selectedCurrency]);


  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    setAttendanceData(prevAttendanceData => {
        const existingAttendanceMap = new Map(prevAttendanceData.map(ad => [ad.employee.id, ad]));
        
        const newAttendanceData = employees.map(employee => {
            if (existingAttendanceMap.has(employee.id)) {
                const existingData = existingAttendanceMap.get(employee.id)!;
                // Update employee info and ensure dailyStatuses length matches current month
                if (existingData.dailyStatuses.length !== daysInMonth) {
                    existingData.dailyStatuses = Array.from({ length: daysInMonth }, (_, i) => existingData.dailyStatuses[i] || 'P');
                }
                return { ...existingData, employee }; 
            } else {
                // New employee, generate default attendance
                const dailyStatuses = Array.from({ length: daysInMonth }, () => 'P');
                const summary = { P: daysInMonth, O: 0, S: 0, L: 0, LW: 0, A: 0, totalPaidDays: daysInMonth };
                return { employee, dailyStatuses, summary };
            }
        });

        // Filter out employees that were deleted
        const employeeIdSet = new Set(employees.map(e => e.id));
        return newAttendanceData.filter(ad => employeeIdSet.has(ad.employee.id));
    });
    // When employees change, payroll becomes stale.
    setPayrollData([]);
  }, [employees]);


  const handleAttendanceChange = (employeeId: string, dayIndex: number, newStatus: string) => {
    setAttendanceData(prevData => {
      const newData = prevData.map(att => {
        if (att.employee.id === employeeId) {
          const newDailyStatuses = [...att.dailyStatuses];
          newDailyStatuses[dayIndex] = newStatus;

          const newSummary = newDailyStatuses.reduce((acc, status) => {
            acc[status as keyof AttendanceSummary] = (acc[status as keyof AttendanceSummary] || 0) + 1;
            return acc;
          }, { P: 0, O: 0, S: 0, L: 0, LW: 0, A: 0 } as any);

          newSummary.totalPaidDays = Object.keys(newSummary).reduce((total, key) => {
            if (ATTENDANCE_STATUSES[key]?.paid) {
              return total + (newSummary[key as keyof AttendanceSummary] || 0);
            }
            return total;
          }, 0);

          return { ...att, dailyStatuses: newDailyStatuses, summary: newSummary };
        }
        return att;
      });
      return newData;
    });
    setPayrollData([]);
  };
  
  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
      const newId = `EMP${Date.now()}`;
      setEmployees(prev => [...prev, { ...newEmployee, id: newId }]);
      // Also add a 'Hired' event to their history
      const hireEvent: EmployeeHistoryEvent = {
        id: `EVT${Date.now()}`,
        employeeId: newId,
        date: newEmployee.joinDate,
        type: EventType.HIRED,
        description: `Hired as ${newEmployee.position} in the ${newEmployee.department} department.`
      };
      setEmployeeHistory(prev => [...prev, hireEvent]);
  };
  
  const handleBulkAddEmployees = (newEmployees: Omit<Employee, 'id'>[]) => {
    const addedEmployeesWithIds: Employee[] = [];
    const historyEvents: EmployeeHistoryEvent[] = [];

    newEmployees.forEach(emp => {
      const newId = `EMP${Date.now()}-${Math.random()}`;
      addedEmployeesWithIds.push({ ...emp, id: newId });
      historyEvents.push({
        id: `EVT${Date.now()}-${Math.random()}`,
        employeeId: newId,
        date: emp.joinDate,
        type: EventType.HIRED,
        description: `Hired as ${emp.position} via CSV import.`
      });
    });

    setEmployees(prev => [...prev, ...addedEmployeesWithIds]);
    setEmployeeHistory(prev => [...prev, ...historyEvents]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    // Optional: could also filter out history, but might be better to keep it for records.
  };

  const handleAddHistoryEvent = (event: Omit<EmployeeHistoryEvent, 'id'>) => {
    setEmployeeHistory(prev => [...prev, { ...event, id: `EVT${Date.now()}` }]);
  };

  const handleFinalizePayroll = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const newRun: HistoricalPayrollRun = {
        year,
        month,
        payrollData: JSON.parse(JSON.stringify(payrollData)),
        employees: JSON.parse(JSON.stringify(employees)),
    };
    
    setHistoricalPayroll(prev => {
        // Remove any existing entry for the same month and year to prevent duplicates
        const filteredHistory = prev.filter(p => !(p.year === year && p.month === month));
        return [...filteredHistory, newRun];
    });

    alert(`Payroll for ${today.toLocaleString('default', { month: 'long', year: 'numeric' })} has been finalized and saved.`);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard employees={employees} selectedCurrency={selectedCurrency} theme={theme} />;
      case 'payroll':
        return <PayrollSystem 
                  employees={employees} 
                  attendanceData={attendanceData} 
                  onPayrollCalculated={setPayrollData} 
                  payrollData={payrollData} 
                  hotelName={hotelName} 
                  historicalPayroll={historicalPayroll}
                  onFinalizePayroll={handleFinalizePayroll}
                  selectedCurrency={selectedCurrency}
                  setSelectedCurrency={setSelectedCurrency}
                />;
      case 'attendance':
        return <Attendance attendanceData={attendanceData} onAttendanceChange={handleAttendanceChange} />;
      case 'reports':
        return <Reports historicalPayroll={historicalPayroll} employees={employees} theme={theme} />;
      case 'settings':
        return <Settings hotelName={hotelName} setHotelName={setHotelName} />;
      case 'employees':
        return <Employees 
                  employees={employees} 
                  employeeHistory={employeeHistory}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  onAddHistoryEvent={handleAddHistoryEvent}
                  onBulkAddEmployees={handleBulkAddEmployees}
                />;
      case 'history':
        return <EmployeeHistory employees={employees} employeeHistory={employeeHistory} />;
      default:
        return <Dashboard employees={employees} selectedCurrency={selectedCurrency} theme={theme} />;
    }
  };

  const NavItem = ({ view, icon, label }: { view: View; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <aside className="no-print w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-xl font-bold">{hotelName}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem view="employees" icon={<Users size={20} />} label="Employees" />
          <NavItem view="history" icon={<History size={20} />} label="Employee History" />
          <NavItem view="attendance" icon={<CalendarCheck size={20} />} label="Attendance" />
          <NavItem view="payroll" icon={<Banknote size={20} />} label="Payroll System" />
          <NavItem view="reports" icon={<FileText size={20} />} label="Reports" />
          <NavItem view="settings" icon={<Cog size={20} />} label="Settings" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
                <p className="text-xs text-center text-gray-500">© {new Date().getFullYear()} {hotelName}</p>
                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme"
                    >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;