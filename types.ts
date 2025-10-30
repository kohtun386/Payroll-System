export enum Department {
  FRONT_OFFICE = "Front Office",
  HOUSEKEEPING = "Housekeeping",
  FOOD_AND_BEVERAGE = "Food & Beverage",
  MANAGEMENT = "Management",
  MAINTENANCE = "Maintenance",
  SECURITY = "Security",
  HR = "Human Resources",
  ADMIN_AND_GENERAL = "Admin & General",
  FINANCE = "Finance",
}

export enum EventType {
  PROMOTION = "Promotion",
  PENALTY = "Penalty / Fine",
  SALARY_CHANGE = "Salary Change",
  NOTE = "General Note",
  HIRED = "Hired",
}

export interface EmployeeHistoryEvent {
  id: string;
  employeeId: string;
  date: string;
  type: EventType;
  description: string;
  amount?: number; // For penalties or salary changes
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Employee {
  id: string;
  name: string;
  department: Department;
  position: string;
  joinDate: string;
  baseSalaryUSD: number;
  servicePoints: number;
  // New fields for detailed tax calculation
  hasSpouse: boolean;
  children: number;
  parents: number;
}

export interface PayrollEntry {
  employeeId: string;
  baseSalary: number;
  serviceCharge: number;
  overtime: number;
  unpaidLeaveDeduction: number;
  grossPay: number;
  tax: number;
  ssb: number;
  manualDeductions: number;
  manualDeductionReason?: string;
  totalDeductions: number;
  netPay: number;
}

export interface AttendanceSummary {
  P: number; // Present
  O: number; // Off Day
  S: number; // Sick Leave
  L: number; // Leave With Pay
  LW: number; // Leave Without Pay
  A: number; // Absent
  totalPaidDays: number;
}

export interface EmployeeAttendance {
  employee: Employee;
  dailyStatuses: string[];
  summary: AttendanceSummary;
}

export interface HistoricalPayrollRun {
  year: number;
  month: number; // 0-11
  payrollData: PayrollEntry[];
  // Storing a snapshot of employees is important in case employees are deleted later
  employees: Employee[];
}