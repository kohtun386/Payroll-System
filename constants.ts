import { Employee, Currency, Department } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1,
  MMK: 3500,
  EUR: 0.92,
  SGD: 1.35,
  THB: 36.5,
  CNY: 7.25,
};

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Aung Aung', department: Department.FRONT_OFFICE, position: 'Receptionist', joinDate: '2022-01-15', baseSalaryUSD: 400, servicePoints: 5, hasSpouse: true, children: 1, parents: 0 },
  { id: 'EMP002', name: 'Ma Mya', department: Department.HOUSEKEEPING, position: 'Room Attendant', joinDate: '2021-11-20', baseSalaryUSD: 300, servicePoints: 4, hasSpouse: false, children: 0, parents: 2 },
  { id: 'EMP003', name: 'Kyaw Kyaw', department: Department.FOOD_AND_BEVERAGE, position: 'Waiter', joinDate: '2023-03-01', baseSalaryUSD: 350, servicePoints: 4, hasSpouse: true, children: 2, parents: 2 },
  { id: 'EMP004', name: 'Hla Hla', department: Department.MANAGEMENT, position: 'Hotel Manager', joinDate: '2020-05-10', baseSalaryUSD: 1500, servicePoints: 10, hasSpouse: true, children: 3, parents: 2 },
  { id: 'EMP005', name: 'Zaw Zaw', department: Department.MAINTENANCE, position: 'Technician', joinDate: '2022-08-01', baseSalaryUSD: 500, servicePoints: 6, hasSpouse: false, children: 0, parents: 0 },
  { id: 'EMP006', name: 'Su Su', department: Department.FRONT_OFFICE, position: 'Concierge', joinDate: '2023-01-20', baseSalaryUSD: 420, servicePoints: 5, hasSpouse: true, children: 0, parents: 0 },
  { id: 'EMP007', name: 'Tin Tin', department: Department.HOUSEKEEPING, position: 'Supervisor', joinDate: '2019-07-15', baseSalaryUSD: 550, servicePoints: 8, hasSpouse: true, children: 1, parents: 1 },
  { id: 'EMP008', name: 'Ba Oo', department: Department.SECURITY, position: 'Security Guard', joinDate: '2023-06-01', baseSalaryUSD: 320, servicePoints: 4, hasSpouse: false, children: 0, parents: 2 },
  { id: 'EMP009', name: 'Aye Aye', department: Department.HR, position: 'HR Coordinator', joinDate: '2022-09-01', baseSalaryUSD: 600, servicePoints: 7, hasSpouse: true, children: 2, parents: 0 },
  { id: 'EMP010', name: 'Myo Myo', department: Department.FOOD_AND_BEVERAGE, position: 'Chef', joinDate: '2021-04-12', baseSalaryUSD: 800, servicePoints: 8, hasSpouse: true, children: 1, parents: 2 },
];

export const ATTENDANCE_STATUSES: { [key: string]: { label: string; color: string; paid: boolean } } = {
  P: { label: 'Present Day', color: 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-300', paid: true },
  O: { label: 'Off Day', color: 'bg-gray-200 text-gray-800 dark:bg-gray-600/50 dark:text-gray-300', paid: true },
  S: { label: 'Sick Leave', color: 'bg-orange-200 text-orange-800 dark:bg-orange-800/50 dark:text-orange-300', paid: true },
  L: { label: 'Leave With Pay', color: 'bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300', paid: true },
  LW: { label: 'Leave Without Pay', color: 'bg-purple-200 text-purple-800 dark:bg-purple-800/50 dark:text-purple-300', paid: false },
  A: { label: 'Absent', color: 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300', paid: false },
};
