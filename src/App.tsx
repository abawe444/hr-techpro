import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { AuthForms } from '@/components/auth/AuthForms';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { BuildingMap } from '@/components/dashboard/BuildingMap';
import { AttendanceCheckIn } from '@/components/attendance/AttendanceCheckIn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
  SignOut,
  ChartLine,
  ClockCounterClockwise,
  CalendarBlank,
  Money,
  Bell,
  UserCircle,
  UserCircleGear,
  Lightning,
  Trophy,
  Plus,
  Check,
  X,
  Clock,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDate, formatTime, generateAITaskSuggestions, predictLateness, generateSmartRecommendation } from '@/lib/ai-helpers';
import type {
  Employee,
  AttendanceRecord,
  Task,
  LeaveRequest,
  PayrollEntry,
  Notification,
  AttendanceStats,
  AITaskSuggestion,
  LatenessPrediction,
} from '@/lib/types';

function App() {
  const [employeesRaw, setEmployees] = useKV<Employee[]>('employees', []);
  const [attendanceRecordsRaw, setAttendanceRecords] = useKV<AttendanceRecord[]>('attendance', []);
  const [tasksRaw, setTasks] = useKV<Task[]>('tasks', []);
  const [leaveRequestsRaw, setLeaveRequests] = useKV<LeaveRequest[]>('leaveRequests', []);
  const [payrollEntriesRaw, setPayrollEntries] = useKV<PayrollEntry[]>('payrollEntries', []);
  const [notificationsRaw, setNotifications] = useKV<Notification[]>('notifications', []);
  
  const employees = employeesRaw ?? [];
  const attendanceRecords = attendanceRecordsRaw ?? [];
  const tasks = tasksRaw ?? [];
  const leaveRequests = leaveRequestsRaw ?? [];
  const payrollEntries = payrollEntriesRaw ?? [];
  const notifications = notificationsRaw ?? [];
  
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion[]>([]);
  const [latenessPredictions, setLatenessPredictions] = useState<LatenessPrediction[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
    dueDate: new Date(),
  });

  const [leaveForm, setLeaveForm] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    type: 'bonus' as const,
    amount: '',
    reason: '',
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const handleLogin = (email: string, password: string) => {
    const employee = (employees ?? []).find((e) => e.email === email && e.password === password);
    
    if (!employee) {
      toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return;
    }
    
    if (employee.isPending) {
      toast.error('حسابك قيد المراجعة. يرجى انتظار تفعيل الحساب من قبل المدير');
      return;
    }
    
    if (!employee.isActive) {
      toast.error('حسابك غير مفعل. يرجى التواصل مع المدير');
      return;
    }
    
    setCurrentUser(employee);
    toast.success(`مرحباً ${employee.name}`);
  };

  const handleRegister = (employeeData: Omit<Employee, 'id' | 'isActive' | 'isPending'>) => {
    const existingEmployee = employees.find((e) => e.email === employeeData.email);
    
    if (existingEmployee) {
      toast.error('البريد الإلكتروني مسجل مسبقاً');
      return;
    }
    
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp_${Date.now()}`,
      isActive: false,
      isPending: true,
    };
    
    setEmployees((current) => [...(current ?? []), newEmployee]);
    toast.success('تم إرسال طلبك بنجاح. سيتم مراجعته من قبل المدير');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.info('تم تسجيل الخروج');
  };

  const handleCheckIn = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att_${Date.now()}`,
    };
    
    setAttendanceRecords((current) => [...(current ?? []), newRecord]);
    
    if (record.isLate) {
      addNotification(record.employeeId, 'تنبيه تأخير', 'تم تسجيل تأخير في الحضور اليوم', 'warning');
    }
  };

  const handleCheckOut = (checkOutTime: string) => {
    const today = formatDate(new Date());
    
    setAttendanceRecords((current) =>
      (current ?? []).map((record) =>
        record.employeeId === currentUser?.id && record.date === today && !record.checkOut
          ? { ...record, checkOut: checkOutTime }
          : record
      )
    );
  };

  const handleApproveEmployee = (employeeId: string) => {
    setEmployees((current) =>
      (current ?? []).map((emp) =>
        emp.id === employeeId
          ? { ...emp, isActive: true, isPending: false }
          : emp
      )
    );
    
    addNotification(employeeId, 'تم تفعيل حسابك', 'يمكنك الآن تسجيل الدخول والبدء في استخدام النظام', 'success');
    toast.success('تم تفعيل الموظف بنجاح');
  };

  const handleRejectEmployee = (employeeId: string) => {
    setEmployees((current) => (current ?? []).filter((emp) => emp.id !== employeeId));
    toast.info('تم رفض الطلب');
  };

  const loadAITaskSuggestions = async () => {
    setLoadingAI(true);
    try {
      const suggestions = await generateAITaskSuggestions(employees, tasks, attendanceRecords);
      setAiSuggestions(suggestions);
    } catch (error) {
      toast.error('فشل تحميل اقتراحات الذكاء الاصطناعي');
    } finally {
      setLoadingAI(false);
    }
  };

  const loadLatenessPredictions = async () => {
    setLoadingAI(true);
    try {
      const predictions = await predictLateness(employees, attendanceRecords);
      setLatenessPredictions(predictions);
    } catch (error) {
      toast.error('فشل تحميل توقعات التأخير');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo) {
      toast.error('يرجى إكمال الحقول المطلوبة');
      return;
    }
    
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      assignedBy: currentUser!.id,
      status: 'pending',
      priority: taskForm.priority,
      dueDate: formatDate(taskForm.dueDate),
      createdAt: new Date().toISOString(),
    };
    
    setTasks((current) => [...(current ?? []), newTask]);
    addNotification(taskForm.assignedTo, 'مهمة جديدة', `تم تعيين مهمة جديدة لك: ${taskForm.title}`, 'info');
    
    setShowTaskDialog(false);
    setTaskForm({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: new Date(),
    });
    
    toast.success('تم إنشاء المهمة بنجاح');
  };

  const handleRequestLeave = () => {
    if (!currentUser) return;
    
    const days = Math.ceil(
      (leaveForm.endDate.getTime() - leaveForm.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    const availableDays = currentUser.vacationDays - currentUser.usedVacationDays;
    
    if (days > availableDays) {
      toast.error(`رصيد الإجازات غير كافٍ. المتاح: ${availableDays} يوم`);
      return;
    }
    
    const newRequest: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: currentUser.id,
      startDate: formatDate(leaveForm.startDate),
      endDate: formatDate(leaveForm.endDate),
      reason: leaveForm.reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      days,
    };
    
    setLeaveRequests((current) => [...(current ?? []), newRequest]);
    
    const adminUsers = employees.filter((e) => e.role === 'admin' || e.role === 'manager');
    adminUsers.forEach((admin) => {
      addNotification(admin.id, 'طلب إجازة جديد', `${currentUser.name} طلب إجازة لمدة ${days} أيام`, 'info');
    });
    
    setShowLeaveDialog(false);
    toast.success('تم إرسال طلب الإجازة');
  };

  const handleApproveLeave = (requestId: string) => {
    const request = leaveRequests.find((r) => r.id === requestId);
    if (!request) return;
    
    setLeaveRequests((current) =>
      (current ?? []).map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: currentUser!.id }
          : r
      )
    );
    
    setEmployees((current) =>
      (current ?? []).map((emp) =>
        emp.id === request.employeeId
          ? { ...emp, usedVacationDays: emp.usedVacationDays + request.days }
          : emp
      )
    );
    
    addNotification(request.employeeId, 'تمت الموافقة على الإجازة', `تمت الموافقة على طلب إجازتك من ${request.startDate} إلى ${request.endDate}`, 'success');
    toast.success('تمت الموافقة على الإجازة');
  };

  const handleRejectLeave = (requestId: string) => {
    const request = leaveRequests.find((r) => r.id === requestId);
    if (!request) return;
    
    setLeaveRequests((current) =>
      (current ?? []).map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: currentUser!.id }
          : r
      )
    );
    
    addNotification(request.employeeId, 'تم رفض طلب الإجازة', `تم رفض طلب إجازتك من ${request.startDate} إلى ${request.endDate}`, 'error');
    toast.info('تم رفض الإجازة');
  };

  const handleAddPayroll = () => {
    if (!payrollForm.employeeId || !payrollForm.amount || !payrollForm.reason) {
      toast.error('يرجى إكمال جميع الحقول');
      return;
    }
    
    const newEntry: PayrollEntry = {
      id: `pay_${Date.now()}`,
      employeeId: payrollForm.employeeId,
      type: payrollForm.type,
      amount: parseFloat(payrollForm.amount),
      reason: payrollForm.reason,
      date: new Date().toISOString(),
      createdBy: currentUser!.id,
    };
    
    setPayrollEntries((current) => [...(current ?? []), newEntry]);
    
    const message = payrollForm.type === 'bonus'
      ? `تم منحك مكافأة بقيمة ${payrollForm.amount} ريال. السبب: ${payrollForm.reason}`
      : `تم خصم ${payrollForm.amount} ريال من راتبك. السبب: ${payrollForm.reason}`;
    
    addNotification(
      payrollForm.employeeId,
      payrollForm.type === 'bonus' ? 'مكافأة جديدة' : 'خصم جديد',
      message,
      payrollForm.type === 'bonus' ? 'success' : 'warning'
    );
    
    setShowPayrollDialog(false);
    setPayrollForm({
      employeeId: '',
      type: 'bonus',
      amount: '',
      reason: '',
    });
    
    toast.success('تم إضافة العملية بنجاح');
  };

  const addNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications((current) => [...(current ?? []), newNotif]);
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((current) =>
      (current ?? []).map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const getStats = (): AttendanceStats => {
    const today = formatDate(new Date());
    const activeEmployees = employees.filter((e) => e.isActive && e.role !== 'admin');
    const todayAttendance = attendanceRecords.filter((r) => r.date === today);
    
    const present = todayAttendance.filter((r) => r.checkIn && !r.isLate).length;
    const late = todayAttendance.filter((r) => r.isLate).length;
    const absent = activeEmployees.length - present - late;
    
    return {
      total: activeEmployees.length,
      present,
      late,
      absent,
    };
  };

  const getTodayAttendance = () => {
    const today = formatDate(new Date());
    return attendanceRecords.filter((r) => r.date === today);
  };

  const getUserTodayAttendance = () => {
    if (!currentUser) return undefined;
    const today = formatDate(new Date());
    return attendanceRecords.find((r) => r.employeeId === currentUser.id && r.date === today);
  };

  const getUserNotifications = () => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.userId === currentUser.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const unreadCount = getUserNotifications().filter((n) => !n.read).length;

  if (!currentUser) {
    return (
      <>
        <AuthForms onLogin={handleLogin} onRegister={handleRegister} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <UserCircleGear size={28} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HR-TechPro</h1>
                <p className="text-sm text-muted-foreground">{isAdmin ? 'لوحة تحكم المدير' : 'حساب الموظف'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">الإشعارات</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getUserNotifications().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات</p>
                      ) : (
                        getUserNotifications().map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-lg border cursor-pointer ${notif.read ? 'bg-muted/30' : 'bg-accent/10 border-accent'}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            <p className="font-semibold text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-semibold text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.department}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <SignOut size={24} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={isAdmin ? "dashboard" : "attendance"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            {isAdmin && (
              <>
                <TabsTrigger value="dashboard">
                  <ChartLine size={20} className="ml-2" />
                  لوحة التحكم
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <Lightning size={20} className="ml-2" />
                  التحليلات الذكية
                </TabsTrigger>
                <TabsTrigger value="employees">
                  <UserCircleGear size={20} className="ml-2" />
                  الموظفين
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="attendance">
              <ClockCounterClockwise size={20} className="ml-2" />
              الحضور
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Check size={20} className="ml-2" />
              المهام
            </TabsTrigger>
            {!isAdmin && (
              <TabsTrigger value="leave">
                <CalendarBlank size={20} className="ml-2" />
                الإجازات
              </TabsTrigger>
            )}
            <TabsTrigger value="payroll">
              <Money size={20} className="ml-2" />
              الرواتب
            </TabsTrigger>
          </TabsList>

          {isAdmin && (
            <>
              <TabsContent value="dashboard" className="space-y-6">
                <StatsCards stats={getStats()} />
                <BuildingMap employees={employees} todayAttendance={getTodayAttendance()} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Lightning size={24} className="text-primary" weight="fill" />
                        اقتراحات تعيين المهام
                      </h3>
                      <Button onClick={loadAITaskSuggestions} disabled={loadingAI} size="sm">
                        {loadingAI ? 'جاري التحميل...' : 'تحديث'}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {aiSuggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          انقر على "تحديث" للحصول على اقتراحات الذكاء الاصطناعي
                        </p>
                      ) : (
                        aiSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{suggestion.employeeName}</p>
                                <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                              </div>
                              <Badge variant="secondary">{suggestion.confidence}%</Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>الأداء</span>
                                <span>{suggestion.performanceScore}%</span>
                              </div>
                              <Progress value={suggestion.performanceScore} className="h-2" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Clock size={24} className="text-accent" weight="fill" />
                        توقعات التأخير
                      </h3>
                      <Button onClick={loadLatenessPredictions} disabled={loadingAI} size="sm">
                        {loadingAI ? 'جاري التحميل...' : 'تحديث'}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {latenessPredictions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          انقر على "تحديث" للحصول على توقعات التأخير
                        </p>
                      ) : (
                        latenessPredictions.map((pred, idx) => (
                          <div key={idx} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{pred.employeeName}</p>
                                <p className="text-xs text-muted-foreground">{pred.pattern}</p>
                              </div>
                              <Badge variant={pred.riskLevel === 'high' ? 'destructive' : pred.riskLevel === 'medium' ? 'secondary' : 'outline'}>
                                {pred.riskLevel === 'high' ? 'عالي' : pred.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>احتمالية التأخير</span>
                                <span>{pred.probability}%</span>
                              </div>
                              <Progress value={pred.probability} className="h-2" />
                              <p className="text-xs text-muted-foreground">تكرار التأخير: {pred.frequency} مرات</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">التوصيات الذكية</h3>
                  <div className="space-y-3">
                    {employees.filter(e => e.isActive && e.role !== 'admin').slice(0, 5).map(emp => (
                      <div key={emp.id} className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{generateSmartRecommendation(emp, attendanceRecords, tasks)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="employees" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">طلبات التفعيل المعلقة</h3>
                  <div className="space-y-3">
                    {employees.filter(e => e.isPending).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">لا توجد طلبات معلقة</p>
                    ) : (
                      employees.filter(e => e.isPending).map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{emp.name}</p>
                              <p className="text-sm text-muted-foreground">{emp.email} • {emp.department}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveEmployee(emp.id)} className="bg-success text-white">
                              <Check size={16} className="ml-1" />
                              موافقة
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectEmployee(emp.id)}>
                              <X size={16} className="ml-1" />
                              رفض
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">جميع الموظفين</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>البريد</TableHead>
                        <TableHead>القسم</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.filter(e => e.isActive).map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-semibold">{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-success">نشط</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="attendance" className="space-y-6">
            {!isAdmin && <AttendanceCheckIn employee={currentUser} todayAttendance={getUserTodayAttendance()} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />}
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">سجل الحضور</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAdmin ? 'الموظف' : 'التاريخ'}</TableHead>
                    <TableHead>الحضور</TableHead>
                    <TableHead>الانصراف</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isAdmin ? attendanceRecords : attendanceRecords.filter(r => r.employeeId === currentUser.id))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map(record => {
                      const emp = employees.find(e => e.id === record.employeeId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{isAdmin ? emp?.name : record.date}</TableCell>
                          <TableCell>{formatTime(record.checkIn)}</TableCell>
                          <TableCell>{record.checkOut ? formatTime(record.checkOut) : '-'}</TableCell>
                          <TableCell>
                            {record.isLate ? (
                              <Badge variant="secondary" className="bg-accent text-white">متأخر</Badge>
                            ) : (
                              <Badge className="bg-success text-white">في الوقت</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => setShowTaskDialog(true)} className="gradient-primary">
                  <Plus size={20} className="ml-2" />
                  إنشاء مهمة جديدة
                </Button>
              </div>
            )}
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">المهام {!isAdmin && 'الخاصة بي'}</h3>
              <div className="space-y-3">
                {(isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser.id)).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد مهام</p>
                ) : (
                  (isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser.id)).map(task => {
                    const assignee = employees.find(e => e.id === task.assignedTo);
                    return (
                      <div key={task.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            {isAdmin && <p className="text-xs text-muted-foreground mt-1">المكلف: {assignee?.name}</p>}
                          </div>
                          <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {task.status === 'completed' ? 'مكتمل' : task.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>الأولوية: {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                          <span>•</span>
                          <span>الموعد النهائي: {task.dueDate}</span>
                        </div>
                        {!isAdmin && task.status !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setTasks(current =>
                                (current ?? []).map(t =>
                                  t.id === task.id
                                    ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
                                    : t
                                )
                              );
                              toast.success('تم إكمال المهمة');
                            }}
                          >
                            إكمال المهمة
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          {!isAdmin && (
            <TabsContent value="leave" className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowLeaveDialog(true)} className="gradient-primary">
                  <Plus size={20} className="ml-2" />
                  طلب إجازة
                </Button>
              </div>

              <Card className="p-6">
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">رصيد الإجازات المتبقي</span>
                    <span className="text-2xl font-bold">{currentUser.vacationDays - currentUser.usedVacationDays} يوم</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">طلبات الإجازات</h3>
                <div className="space-y-3">
                  {leaveRequests.filter(r => r.employeeId === currentUser.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">لا توجد طلبات</p>
                  ) : (
                    leaveRequests.filter(r => r.employeeId === currentUser.id).map(request => (
                      <div key={request.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">من {request.startDate} إلى {request.endDate}</p>
                            <p className="text-sm text-muted-foreground">{request.reason}</p>
                            <p className="text-xs text-muted-foreground">المدة: {request.days} يوم</p>
                          </div>
                          <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {request.status === 'approved' ? 'موافق' : request.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="payroll" className="space-y-6">
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => setShowPayrollDialog(true)} className="gradient-primary">
                  <Plus size={20} className="ml-2" />
                  إضافة مكافأة/خصم
                </Button>
              </div>
            )}

            {isAdmin && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">طلبات الإجازات</h3>
                <div className="space-y-3">
                  {leaveRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد طلبات معلقة</p>
                  ) : (
                    leaveRequests.filter(r => r.status === 'pending').map(request => {
                      const emp = employees.find(e => e.id === request.employeeId);
                      return (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{emp?.name}</p>
                            <p className="text-sm text-muted-foreground">من {request.startDate} إلى {request.endDate} ({request.days} يوم)</p>
                            <p className="text-xs text-muted-foreground mt-1">السبب: {request.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveLeave(request.id)} className="bg-success text-white">
                              <Check size={16} className="ml-1" />
                              موافقة
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectLeave(request.id)}>
                              <X size={16} className="ml-1" />
                              رفض
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">المكافآت والخصومات</h3>
              
              {!isAdmin && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">إجمالي المكافآت</p>
                    <p className="text-2xl font-bold text-success">
                      {payrollEntries.filter(e => e.employeeId === currentUser.id && e.type === 'bonus').reduce((sum, e) => sum + e.amount, 0)} ريال
                    </p>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">إجمالي الخصومات</p>
                    <p className="text-2xl font-bold text-destructive">
                      {payrollEntries.filter(e => e.employeeId === currentUser.id && e.type === 'deduction').reduce((sum, e) => sum + e.amount, 0)} ريال
                    </p>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>الموظف</TableHead>}
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isAdmin ? payrollEntries : payrollEntries.filter(e => e.employeeId === currentUser.id))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => {
                      const emp = employees.find(e => e.id === entry.employeeId);
                      return (
                        <TableRow key={entry.id}>
                          {isAdmin && <TableCell>{emp?.name}</TableCell>}
                          <TableCell>
                            <Badge variant={entry.type === 'bonus' ? 'default' : 'destructive'} className={entry.type === 'bonus' ? 'bg-success' : ''}>
                              {entry.type === 'bonus' ? 'مكافأة' : 'خصم'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{entry.amount} ريال</TableCell>
                          <TableCell>{entry.reason}</TableCell>
                          <TableCell>{new Date(entry.date).toLocaleDateString('ar-SA')}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
            <DialogDescription>قم بتعيين مهمة جديدة لأحد الموظفين</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">عنوان المهمة *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="أدخل عنوان المهمة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">الوصف</Label>
              <Textarea
                id="task-desc"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="أدخل وصف المهمة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-assignee">المكلف *</Label>
              <Select value={taskForm.assignedTo} onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}>
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.isActive && e.role !== 'admin').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-semibold">اقتراحات الذكاء الاصطناعي:</p>
                {aiSuggestions.slice(0, 3).map((sug, idx) => (
                  <button
                    key={idx}
                    className="w-full text-right p-2 hover:bg-background rounded text-sm"
                    onClick={() => setTaskForm({ ...taskForm, assignedTo: sug.employeeId })}
                  >
                    {sug.employeeName} - ثقة {sug.confidence}%
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreateTask} className="gradient-primary">إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طلب إجازة</DialogTitle>
            <DialogDescription>
              الرصيد المتاح: {currentUser.vacationDays - currentUser.usedVacationDays} يوم
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right">
                    {leaveForm.startDate.toLocaleDateString('ar-SA')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={leaveForm.startDate}
                    onSelect={(date) => date && setLeaveForm({ ...leaveForm, startDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>تاريخ النهاية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right">
                    {leaveForm.endDate.toLocaleDateString('ar-SA')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={leaveForm.endDate}
                    onSelect={(date) => date && setLeaveForm({ ...leaveForm, endDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-reason">السبب</Label>
              <Textarea
                id="leave-reason"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                placeholder="أدخل سبب الإجازة"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>إلغاء</Button>
            <Button onClick={handleRequestLeave} className="gradient-primary">إرسال الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مكافأة أو خصم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الموظف *</Label>
              <Select value={payrollForm.employeeId} onValueChange={(value) => setPayrollForm({ ...payrollForm, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.isActive && e.role !== 'admin').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={payrollForm.type} onValueChange={(value: any) => setPayrollForm({ ...payrollForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">مكافأة</SelectItem>
                  <SelectItem value="deduction">خصم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payroll-amount">المبلغ *</Label>
              <Input
                id="payroll-amount"
                type="number"
                value={payrollForm.amount}
                onChange={(e) => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payroll-reason">السبب *</Label>
              <Textarea
                id="payroll-reason"
                value={payrollForm.reason}
                onChange={(e) => setPayrollForm({ ...payrollForm, reason: e.target.value })}
                placeholder="أدخل سبب المكافأة/الخصم"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayrollDialog(false)}>إلغاء</Button>
            <Button onClick={handleAddPayroll} className="gradient-primary">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;