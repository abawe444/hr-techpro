import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Fingerprint, WifiHigh, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { requestBiometricAuth, getCurrentTimeString, isLateCheckIn, formatDate, formatTime } from '@/lib/ai-helpers';
import type { AttendanceRecord, Employee, WiFiRouter } from '@/lib/types';

interface AttendanceCheckInProps {
  employee: Employee;
  todayAttendance: AttendanceRecord | undefined;
  onCheckIn: (record: Omit<AttendanceRecord, 'id'>) => void;
  onCheckOut: (checkOutTime: string) => void;
  routers: WiFiRouter[];
}

export function AttendanceCheckIn({ employee, todayAttendance, onCheckIn, onCheckOut, routers }: AttendanceCheckInProps) {
  const [loading, setLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');

  const handleCheckIn = async () => {
    if (!selectedNetwork) {
      toast.error('يجب اختيار شبكة الواي فاي المتصل بها');
      return;
    }

    setLoading(true);
    
    try {
      const biometricSuccess = await requestBiometricAuth();
      if (!biometricSuccess) {
        toast.error('فشلت المصادقة البيومترية');
        setLoading(false);
        return;
      }

      const checkInTime = getCurrentTimeString();
      const isLate = isLateCheckIn(checkInTime);
      const network = routers.find(n => n.ssid === selectedNetwork);

      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 12;
      const x = (network?.position.x || 50) + Math.cos(angle) * distance;
      const y = (network?.position.y || 45) + Math.sin(angle) * distance;

      const record: Omit<AttendanceRecord, 'id'> = {
        employeeId: employee.id,
        checkIn: checkInTime,
        date: formatDate(new Date()),
        isLate,
        wifiVerified: true,
        biometricVerified: true,
        wifiNetwork: selectedNetwork,
        location: {
          x,
          y,
          zone: network?.zone || 'center'
        }
      };

      onCheckIn(record);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={20} weight="bold" />
          <div>
            <p className="font-bold">تم تسجيل الحضور بنجاح</p>
            <p className="text-sm">{formatTime(checkInTime)} - {network?.name}</p>
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
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-lg sm:text-xl font-bold">تسجيل الحضور والانصراف</h3>
          {selectedNetwork && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <WifiHigh size={16} weight="fill" className="sm:w-5 sm:h-5 text-success" />
              <span className="hidden sm:inline">متصل: {routers.find(n => n.ssid === selectedNetwork)?.name}</span>
              <span className="sm:hidden">متصل</span>
            </div>
          )}
        </div>

        {!hasCheckedIn && (
          <div className="space-y-2">
            <Label htmlFor="wifi-network">اختر شبكة الواي فاي المتصل بها</Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger id="wifi-network">
                <SelectValue placeholder="اختر الشبكة..." />
              </SelectTrigger>
              <SelectContent>
                {routers.map(network => (
                  <SelectItem key={network.ssid} value={network.ssid}>
                    <div className="flex items-center gap-2">
                      <WifiHigh size={16} weight="fill" />
                      {network.name} ({network.ssid})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {todayAttendance && (
          <div className="p-3 sm:p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">وقت الحضور</span>
              <span className="font-bold text-sm sm:text-base">{todayAttendance.checkIn ? formatTime(todayAttendance.checkIn) : '-'}</span>
            </div>
            {todayAttendance.wifiNetwork && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">الموقع</span>
                <span className="font-bold text-sm sm:text-base">
                  {routers.find(n => n.ssid === todayAttendance.wifiNetwork)?.name || todayAttendance.wifiNetwork}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">وقت الانصراف</span>
              <span className="font-bold text-sm sm:text-base">{todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '-'}</span>
            </div>
            {todayAttendance.isLate && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs sm:text-sm text-accent font-semibold">⚠️ تم تسجيل تأخير</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {!hasCheckedIn && (
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 h-20 sm:h-24 text-base sm:text-lg font-bold"
              onClick={handleCheckIn}
              disabled={loading || !selectedNetwork}
            >
              <div className="flex flex-col items-center gap-2">
                <Fingerprint size={28} weight="fill" className="sm:w-8 sm:h-8" />
                <span>تسجيل الحضور</span>
              </div>
            </Button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <Button
              size="lg"
              variant="secondary"
              className="h-20 sm:h-24 text-base sm:text-lg font-bold"
              onClick={handleCheckOut}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                <Fingerprint size={28} weight="fill" className="sm:w-8 sm:h-8" />
                <span>تسجيل الانصراف</span>
              </div>
            </Button>
          )}

          {hasCheckedIn && hasCheckedOut && (
            <div className="p-4 sm:p-6 bg-success/10 border-2 border-success rounded-lg text-center">
              <Check size={40} weight="bold" className="text-success mx-auto mb-2 sm:w-12 sm:h-12" />
              <p className="font-bold text-success text-base sm:text-lg">تم تسجيل الحضور والانصراف لليوم</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
