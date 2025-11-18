import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fingerprint, WifiHigh, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { isConnectedToApprovedWiFi, requestBiometricAuth, getCurrentTimeString, isLateCheckIn, formatDate, formatTime } from '@/lib/ai-helpers';
import type { AttendanceRecord, Employee } from '@/lib/types';

interface AttendanceCheckInProps {
  employee: Employee;
  todayAttendance: AttendanceRecord | undefined;
  onCheckIn: (record: Omit<AttendanceRecord, 'id'>) => void;
  onCheckOut: (checkOutTime: string) => void;
}

export function AttendanceCheckIn({ employee, todayAttendance, onCheckIn, onCheckOut }: AttendanceCheckInProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    
    try {
      const wifiConnected = await isConnectedToApprovedWiFi();
      if (!wifiConnected) {
        toast.error('يجب الاتصال بشبكة الواي فاي المعتمدة');
        setLoading(false);
        return;
      }

      const biometricSuccess = await requestBiometricAuth();
      if (!biometricSuccess) {
        toast.error('فشلت المصادقة البيومترية');
        setLoading(false);
        return;
      }

      const checkInTime = getCurrentTimeString();
      const isLate = isLateCheckIn(checkInTime);

      const record: Omit<AttendanceRecord, 'id'> = {
        employeeId: employee.id,
        checkIn: checkInTime,
        date: formatDate(new Date()),
        isLate,
        wifiVerified: true,
        biometricVerified: true
      };

      onCheckIn(record);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={20} weight="bold" />
          <div>
            <p className="font-bold">تم تسجيل الحضور بنجاح</p>
            <p className="text-sm">{formatTime(checkInTime)}</p>
          </div>
        </div>
      );
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الحضور');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    
    try {
      const wifiConnected = await isConnectedToApprovedWiFi();
      if (!wifiConnected) {
        toast.error('يجب الاتصال بشبكة الواي فاي المعتمدة');
        setLoading(false);
        return;
      }

      const biometricSuccess = await requestBiometricAuth();
      if (!biometricSuccess) {
        toast.error('فشلت المصادقة البيومترية');
        setLoading(false);
        return;
      }

      const checkOutTime = getCurrentTimeString();
      onCheckOut(checkOutTime);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={20} weight="bold" />
          <div>
            <p className="font-bold">تم تسجيل الانصراف بنجاح</p>
            <p className="text-sm">{formatTime(checkOutTime)}</p>
          </div>
        </div>
      );
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الانصراف');
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = todayAttendance?.checkIn;
  const hasCheckedOut = todayAttendance?.checkOut;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">تسجيل الحضور والانصراف</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WifiHigh size={20} weight="fill" className="text-success" />
            <span>متصل بالشبكة المعتمدة</span>
          </div>
        </div>

        {todayAttendance && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">وقت الحضور</span>
              <span className="font-bold">{todayAttendance.checkIn ? formatTime(todayAttendance.checkIn) : '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">وقت الانصراف</span>
              <span className="font-bold">{todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '-'}</span>
            </div>
            {todayAttendance.isLate && (
              <div className="pt-2 border-t border-border">
                <span className="text-sm text-accent font-semibold">⚠️ تم تسجيل تأخير</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hasCheckedIn && (
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 h-24 text-lg font-bold"
              onClick={handleCheckIn}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                <Fingerprint size={32} weight="fill" />
                <span>تسجيل الحضور</span>
              </div>
            </Button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <Button
              size="lg"
              variant="secondary"
              className="h-24 text-lg font-bold col-span-full"
              onClick={handleCheckOut}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                <Fingerprint size={32} weight="fill" />
                <span>تسجيل الانصراف</span>
              </div>
            </Button>
          )}

          {hasCheckedIn && hasCheckedOut && (
            <div className="col-span-full p-6 bg-success/10 border-2 border-success rounded-lg text-center">
              <Check size={48} weight="bold" className="text-success mx-auto mb-2" />
              <p className="font-bold text-success text-lg">تم تسجيل الحضور والانصراف لليوم</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
