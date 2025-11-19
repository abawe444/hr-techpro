export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  rank: string;
  salary: number;
  department: string;
  role: 'employee' | 'team_lead' | 'supervisor' | 'manager' | 'admin';
  region: string;
  isActive: boolean;
  isPending: boolean;
  password: string;
  avatar?: string;
  vacationDays: number;
  usedVacationDays: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  isLate: boolean;
  wifiVerified: boolean;
  biometricVerified: boolean;
  wifiNetwork?: string;
  location?: {
    x: number;
    y: number;
    zone: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  days: number;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  type: 'deduction' | 'bonus';
  amount: number;
  reason: string;
  date: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AITaskSuggestion {
  employeeId: string;
  employeeName: string;
  confidence: number;
  reason: string;
  currentWorkload: number;
  performanceScore: number;
}

export interface LatenessPrediction {
  employeeId: string;
  employeeName: string;
  probability: number;
  riskLevel: 'low' | 'medium' | 'high';
  pattern: string;
  lastLate: string;
  frequency: number;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface WiFiRouter {
  id: string;
  name: string;
  ssid: string;
  zone: 'right' | 'center' | 'left';
  position: {
    x: number;
    y: number;
  };
  range: number;
  icon?: string;
  iconSize?: number;
  signalColor?: string;
  signalOpacity?: number;
  signalPattern?: 'solid' | 'dashed' | 'dotted' | 'waves';
  signalRings?: number;
  customImage?: string;
}

export interface EmployeeLocation {
  employeeId: string;
  employee: Employee;
  position: {
    x: number;
    y: number;
  };
  wifiNetwork: string;
  lastUpdate: string;
  status: 'present' | 'late' | 'absent';
}
