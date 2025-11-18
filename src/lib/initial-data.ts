import type { Employee } from './types';

declare const spark: {
  user: () => Promise<{ email: string }>;
};

export async function getDefaultAdminEmail(): Promise<string> {
  try {
    const user = await spark.user();
    return user.email || 'admin@hr-techpro.com';
  } catch {
    return 'admin@hr-techpro.com';
  }
}

export async function createDefaultAdmin(): Promise<Employee> {
  const email = await getDefaultAdminEmail();
  
  return {
    id: 'admin_default',
    name: 'مدير النظام',
    email: email,
    employeeId: 'ADMIN001',
    rank: 'مدير عام',
    salary: 20000,
    department: 'الإدارة',
    role: 'admin',
    region: 'المركز الرئيسي',
    isActive: true,
    isPending: false,
    password: 'admin123',
    vacationDays: 30,
    usedVacationDays: 0,
  };
}

export const SAMPLE_EMPLOYEES: Omit<Employee, 'isActive' | 'isPending'>[] = [
  {
    id: 'emp_001',
    name: 'أحمد محمد السعيد',
    email: 'ahmed.said@company.com',
    employeeId: 'EMP001',
    rank: 'مطور أول',
    salary: 15000,
    department: 'تقنية المعلومات',
    role: 'employee',
    region: 'الرياض',
    password: 'emp123',
    vacationDays: 30,
    usedVacationDays: 5,
  },
  {
    id: 'emp_002',
    name: 'فاطمة خالد العتيبي',
    email: 'fatima.otaibi@company.com',
    employeeId: 'EMP002',
    rank: 'محاسبة قانونية',
    salary: 12000,
    department: 'المالية',
    role: 'employee',
    region: 'الرياض',
    password: 'emp123',
    vacationDays: 30,
    usedVacationDays: 3,
  },
  {
    id: 'emp_003',
    name: 'خالد عبدالله النمر',
    email: 'khaled.namer@company.com',
    employeeId: 'EMP003',
    rank: 'مشرف مبيعات',
    salary: 14000,
    department: 'المبيعات',
    role: 'supervisor',
    region: 'جدة',
    password: 'emp123',
    vacationDays: 30,
    usedVacationDays: 0,
  },
  {
    id: 'emp_004',
    name: 'نورة سعد الغامدي',
    email: 'noura.ghamdi@company.com',
    employeeId: 'EMP004',
    rank: 'مديرة موارد بشرية',
    salary: 16000,
    department: 'الموارد البشرية',
    role: 'manager',
    region: 'الرياض',
    password: 'emp123',
    vacationDays: 30,
    usedVacationDays: 7,
  },
  {
    id: 'emp_005',
    name: 'محمد عمر القحطاني',
    email: 'mohammed.qahtani@company.com',
    employeeId: 'EMP005',
    rank: 'مطور واجهات',
    salary: 13000,
    department: 'تقنية المعلومات',
    role: 'employee',
    region: 'الدمام',
    password: 'emp123',
    vacationDays: 30,
    usedVacationDays: 2,
  },
];
