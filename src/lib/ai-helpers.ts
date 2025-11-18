import type { Employee, AttendanceRecord, Task, AITaskSuggestion, LatenessPrediction } from './types';

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>;
};

export const APPROVED_WIFI_SSID = 'CompanyWiFi_Secure';
export const WORK_START_TIME = '09:00';
export const LATE_THRESHOLD_MINUTES = 15;

export function isConnectedToApprovedWiFi(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
}

export async function requestBiometricAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() > 0.1);
    }, 800);
  });
}

export function isLateCheckIn(checkInTime: string): boolean {
  const [hours, minutes] = checkInTime.split(':').map(Number);
  const [workHours, workMinutes] = WORK_START_TIME.split(':').map(Number);
  
  const checkInMinutes = hours * 60 + minutes;
  const workStartMinutes = workHours * 60 + workMinutes;
  
  return checkInMinutes > workStartMinutes + LATE_THRESHOLD_MINUTES;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'م' : 'ص';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function calculateWorkHours(checkIn: string, checkOut: string): number {
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;
  
  return (outMinutes - inMinutes) / 60;
}

export async function generateAITaskSuggestions(
  employees: Employee[],
  tasks: Task[],
  attendanceRecords: AttendanceRecord[]
): Promise<AITaskSuggestion[]> {
  const prompt = spark.llmPrompt`
    Analyze the following employee data and suggest the top 3 employees for a new task assignment.
    
    Employees: ${JSON.stringify(employees.filter(e => e.isActive && e.role !== 'admin').map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      department: e.department
    })))}
    
    Current Tasks: ${JSON.stringify(tasks.filter(t => t.status !== 'completed').map(t => ({
      assignedTo: t.assignedTo,
      status: t.status
    })))}
    
    Recent Attendance: ${JSON.stringify(attendanceRecords.slice(-30).map(r => ({
      employeeId: r.employeeId,
      isLate: r.isLate,
      hasCheckOut: !!r.checkOut
    })))}
    
    Return a JSON object with a "suggestions" property containing an array of exactly 3 employee suggestions.
    Each suggestion should have:
    - employeeId: the employee's ID
    - confidence: a number between 0-100 representing confidence in this assignment
    - reason: a brief Arabic explanation (one sentence)
    - currentWorkload: estimated number of active tasks
    - performanceScore: estimated score 0-100 based on attendance and completion
    
    Format: {"suggestions": [{"employeeId": "id", "confidence": 85, "reason": "سبب الاختيار", "currentWorkload": 2, "performanceScore": 90}, ...]}
  `;
  
  try {
    const result = await spark.llm(prompt, 'gpt-4o-mini', true);
    const parsed = JSON.parse(result);
    
    return parsed.suggestions.map((s: any) => ({
      employeeId: s.employeeId,
      employeeName: employees.find(e => e.id === s.employeeId)?.name || '',
      confidence: s.confidence,
      reason: s.reason,
      currentWorkload: s.currentWorkload,
      performanceScore: s.performanceScore
    }));
  } catch (error) {
    const activeEmployees = employees.filter(e => e.isActive && e.role !== 'admin');
    return activeEmployees.slice(0, 3).map((emp, idx) => ({
      employeeId: emp.id,
      employeeName: emp.name,
      confidence: 75 - idx * 10,
      reason: 'موظف نشط ومتاح',
      currentWorkload: tasks.filter(t => t.assignedTo === emp.id && t.status !== 'completed').length,
      performanceScore: 80
    }));
  }
}

export async function predictLateness(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[]
): Promise<LatenessPrediction[]> {
  const prompt = spark.llmPrompt`
    Analyze employee attendance patterns and predict who is likely to be late tomorrow.
    
    Attendance records (last 30 days): ${JSON.stringify(attendanceRecords.slice(-100).map(r => ({
      employeeId: r.employeeId,
      date: r.date,
      checkIn: r.checkIn,
      isLate: r.isLate
    })))}
    
    Employees: ${JSON.stringify(employees.filter(e => e.isActive && e.role !== 'admin').map(e => ({
      id: e.id,
      name: e.name
    })))}
    
    Return a JSON object with a "predictions" property containing an array of employees at risk of being late.
    Include only employees with meaningful risk (>30% probability).
    Each prediction should have:
    - employeeId: the employee's ID
    - probability: number 0-100 representing likelihood of lateness
    - riskLevel: "low" (30-50%), "medium" (50-70%), or "high" (>70%)
    - pattern: brief Arabic description of the pattern observed
    - frequency: number of times late in last 30 days
    
    Format: {"predictions": [{"employeeId": "id", "probability": 65, "riskLevel": "medium", "pattern": "نمط التأخير", "frequency": 5}, ...]}
  `;
  
  try {
    const result = await spark.llm(prompt, 'gpt-4o-mini', true);
    const parsed = JSON.parse(result);
    
    return parsed.predictions.map((p: any) => {
      const employee = employees.find(e => e.id === p.employeeId);
      const employeeRecords = attendanceRecords
        .filter(r => r.employeeId === p.employeeId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastLateRecord = employeeRecords.find(r => r.isLate);
      
      return {
        employeeId: p.employeeId,
        employeeName: employee?.name || '',
        probability: p.probability,
        riskLevel: p.riskLevel,
        pattern: p.pattern,
        lastLate: lastLateRecord?.date || '',
        frequency: p.frequency
      };
    });
  } catch (error) {
    const predictions: LatenessPrediction[] = [];
    
    employees.filter(e => e.isActive && e.role !== 'admin').forEach(emp => {
      const empRecords = attendanceRecords.filter(r => r.employeeId === emp.id).slice(-30);
      const lateCount = empRecords.filter(r => r.isLate).length;
      const probability = Math.min((lateCount / Math.max(empRecords.length, 1)) * 100, 100);
      
      if (probability > 30) {
        const lastLateRecord = empRecords.filter(r => r.isLate).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        predictions.push({
          employeeId: emp.id,
          employeeName: emp.name,
          probability: Math.round(probability),
          riskLevel: probability > 70 ? 'high' : probability > 50 ? 'medium' : 'low',
          pattern: lateCount > 5 ? 'تأخير متكرر' : 'تأخير متقطع',
          lastLate: lastLateRecord?.date || '',
          frequency: lateCount
        });
      }
    });
    
    return predictions;
  }
}

export function generateSmartRecommendation(
  employee: Employee,
  attendanceRecords: AttendanceRecord[],
  tasks: Task[]
): string {
  const empRecords = attendanceRecords.filter(r => r.employeeId === employee.id).slice(-30);
  const lateCount = empRecords.filter(r => r.isLate).length;
  const completedTasks = tasks.filter(t => t.assignedTo === employee.id && t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.assignedTo === employee.id && t.status !== 'completed').length;
  
  if (lateCount >= 5) {
    return `الموظف ${employee.name} تأخر ${lateCount} مرات في آخر 30 يوم. الإجراء المقترح: إرسال تنبيه رسمي`;
  }
  
  if (pendingTasks > 5) {
    return `الموظف ${employee.name} لديه ${pendingTasks} مهمة معلقة. الإجراء المقترح: مراجعة توزيع الأعباء`;
  }
  
  if (completedTasks > 10 && lateCount === 0) {
    return `الموظف ${employee.name} أداء ممتاز (${completedTasks} مهمة مكتملة، لا تأخير). الإجراء المقترح: منح مكافأة`;
  }
  
  return 'لا توجد توصيات في الوقت الحالي';
}
