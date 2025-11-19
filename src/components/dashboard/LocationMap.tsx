import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WifiHigh } from '@phosphor-icons/react';
import type { Employee, AttendanceRecord, WiFiRouter, EmployeeLocation } from '@/lib/types';

interface LocationMapProps {
  employees: Employee[];
  todayAttendance: AttendanceRecord[];
  routers: WiFiRouter[];
}

export function LocationMap({ employees, todayAttendance, routers }: LocationMapProps) {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);

  useEffect(() => {
    const presentEmployees = todayAttendance
      .filter(record => record.checkIn && !record.checkOut)
      .map(record => {
        const employee = employees.find(e => e.id === record.employeeId);
        if (!employee) return null;

        const router = routers.find(r => r.ssid === record.wifiNetwork) || routers[0];
        
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (router.range - 3);
        
        const location: EmployeeLocation = {
          employeeId: employee.id,
          employee,
          position: {
            x: router.position.x + Math.cos(angle) * distance,
            y: router.position.y + Math.sin(angle) * distance
          },
          wifiNetwork: record.wifiNetwork || router.ssid,
          lastUpdate: new Date().toISOString(),
          status: record.isLate ? 'late' : 'present'
        };

        return location;
      })
      .filter(Boolean) as EmployeeLocation[];

    setEmployeeLocations(presentEmployees);

    const interval = setInterval(() => {
      setEmployeeLocations(prevLocations => 
        prevLocations.map(loc => {
          const router = routers.find(r => r.ssid === loc.wifiNetwork);
          if (!router) return loc;

          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * (router.range - 3);
          const newX = router.position.x + Math.cos(angle) * distance;
          const newY = router.position.y + Math.sin(angle) * distance;

          return {
            ...loc,
            position: {
              x: loc.position.x + (newX - loc.position.x) * 0.1,
              y: loc.position.y + (newY - loc.position.y) * 0.1
            }
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [employees, todayAttendance, routers]);

  const getRouterEmployees = (routerSSID: string) => {
    return employeeLocations.filter(loc => loc.wifiNetwork === routerSSID);
  };

  const filteredLocations = selectedRouter 
    ? employeeLocations.filter(loc => loc.wifiNetwork === selectedRouter)
    : employeeLocations;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2">خريطة المراكز الحية</h3>
          <p className="text-sm text-muted-foreground">
            تتبع موقع الموظفين في الوقت الفعلي عبر شبكات الواي فاي
          </p>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={selectedRouter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRouter(null)}
            className="flex-shrink-0"
          >
            الكل ({employeeLocations.length})
          </Button>
          {routers.map(router => (
            <Button
              key={router.id}
              variant={selectedRouter === router.ssid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRouter(router.ssid)}
              className="flex-shrink-0 text-xs"
            >
              <WifiHigh size={16} className="ml-1" />
              {router.name} ({getRouterEmployees(router.ssid).length})
            </Button>
          ))}
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden" style={{ paddingBottom: '60%' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect x="2" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
            <rect x="35" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
            <rect x="68" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />

            <line x1="2" y1="15" x2="32" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />
            <line x1="35" y1="15" x2="65" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />
            <line x1="68" y1="15" x2="98" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />

            <text x="17" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              المركز الأيسر
            </text>
            <text x="50" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              المركز الأوسط
            </text>
            <text x="83" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              مركز أمان المحرك
            </text>

            {routers.map(router => (
              <g key={router.id}>
                <circle
                  cx={router.position.x}
                  cy={router.position.y}
                  r={router.range}
                  fill="oklch(0.72 0.15 50 / 0.05)"
                  stroke="oklch(0.72 0.15 50 / 0.2)"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                />
                <circle
                  cx={router.position.x}
                  cy={router.position.y}
                  r="2"
                  fill="oklch(0.72 0.15 50)"
                  className="pulse-dot"
                />
                <circle
                  cx={router.position.x}
                  cy={router.position.y}
                  r="1"
                  fill="white"
                />
              </g>
            ))}

            {filteredLocations.map((location, index) => (
              <g key={location.employeeId} className="employee-marker">
                <circle
                  cx={location.position.x}
                  cy={location.position.y}
                  r="2.5"
                  fill={location.status === 'late' ? 'oklch(0.68 0.17 35)' : 'oklch(0.65 0.18 145)'}
                  opacity="0.3"
                  className="pulse-dot"
                />
                <circle
                  cx={location.position.x}
                  cy={location.position.y}
                  r="1.5"
                  fill={location.status === 'late' ? 'oklch(0.68 0.17 35)' : 'oklch(0.65 0.18 145)'}
                />
                <title>{location.employee.name}</title>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-success/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm font-semibold">في الوقت المحدد</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {employeeLocations.filter(l => l.status === 'present').length}
            </p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm font-semibold">متأخرون</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {employeeLocations.filter(l => l.status === 'late').length}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-sm">الموظفون الحاليون ({filteredLocations.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {filteredLocations.map(location => (
              <div
                key={location.employeeId}
                className="flex items-center gap-2 p-2 bg-muted rounded-lg"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={location.employee.avatar} />
                  <AvatarFallback className="text-xs">
                    {location.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{location.employee.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{location.employee.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
