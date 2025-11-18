import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Employee, AttendanceRecord } from '@/lib/types';
import { formatDate } from '@/lib/ai-helpers';

interface BuildingMapProps {
  employees: Employee[];
  todayAttendance: AttendanceRecord[];
}

export function BuildingMap({ employees, todayAttendance }: BuildingMapProps) {
  const today = formatDate(new Date());
  
  const getEmployeeStatus = (empId: string) => {
    const attendance = todayAttendance.find(a => a.employeeId === empId && a.date === today);
    if (!attendance || !attendance.checkIn) return 'absent';
    if (attendance.isLate) return 'late';
    return 'present';
  };

  const activeEmployees = employees.filter(e => e.isActive && e.role !== 'admin');
  const presentEmployees = activeEmployees.filter(e => getEmployeeStatus(e.id) === 'present');
  const lateEmployees = activeEmployees.filter(e => getEmployeeStatus(e.id) === 'late');
  const absentEmployees = activeEmployees.filter(e => getEmployeeStatus(e.id) === 'absent');

  const EmployeeItem = ({ employee, status }: { employee: Employee; status: string }) => {
    const statusColors = {
      present: 'bg-success',
      late: 'bg-accent',
      absent: 'bg-destructive'
    };

    const statusText = {
      present: 'حاضر',
      late: 'متأخر',
      absent: 'غائب'
    };

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status as keyof typeof statusColors]} ${status === 'present' ? 'pulse-dot' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{employee.name}</p>
          <p className="text-xs text-muted-foreground truncate">{employee.department}</p>
        </div>
        <Badge variant={status === 'present' ? 'default' : status === 'late' ? 'secondary' : 'destructive'} className="text-xs">
          {statusText[status as keyof typeof statusText]}
        </Badge>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-success pulse-dot" />
          <h3 className="font-bold text-lg">حاضر ({presentEmployees.length})</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {presentEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موظفين حاضرين</p>
          ) : (
            presentEmployees.map(emp => <EmployeeItem key={emp.id} employee={emp} status="present" />)
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <h3 className="font-bold text-lg">متأخر ({lateEmployees.length})</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {lateEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موظفين متأخرين</p>
          ) : (
            lateEmployees.map(emp => <EmployeeItem key={emp.id} employee={emp} status="late" />)
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <h3 className="font-bold text-lg">غائب ({absentEmployees.length})</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {absentEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موظفين غائبين</p>
          ) : (
            absentEmployees.map(emp => <EmployeeItem key={emp.id} employee={emp} status="absent" />)
          )}
        </div>
      </Card>
    </div>
  );
}
