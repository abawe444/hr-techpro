import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiHigh, User } from '@phosphor-icons/react';
import type { Employee, AttendanceRecord, WiFiRouter, EmployeeLocation } from '@/lib/types';
import { formatDate } from '@/lib/ai-helpers';

interface LocationMapProps {
  employees: Employee[];
  todayAttendance: AttendanceRecord[];
  routers: WiFiRouter[];
}

export function LocationMap({ employees, todayAttendance, routers }: LocationMapProps) {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);

  useEffect(() => {
    const today = formatDate(new Date());
    const locations: EmployeeLocation[] = [];

    todayAttendance.forEach(attendance => {
      if (attendance.checkIn && !attendance.checkOut) {
        const employee = employees.find(e => e.id === attendance.employeeId);
        if (employee && employee.isActive && employee.role !== 'admin') {
          const router = routers[Math.floor(Math.random() * routers.length)];
          
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * (router.range - 3);
          const x = router.position.x + Math.cos(angle) * distance;
          const y = router.position.y + Math.sin(angle) * distance;

          locations.push({
            employeeId: employee.id,
            employee: employee,
            position: { x, y },
            wifiNetwork: router.ssid,
            lastUpdate: attendance.checkIn,
            status: attendance.isLate ? 'late' : 'present'
          });
        }
      }
    });

    setEmployeeLocations(locations);

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
            <rect x="2" y="15" width="96" height="30" fill="oklch(0.92 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" />
            
            <line x1="35" y1="15" x2="35" y2="45" stroke="oklch(0.68 0.17 35)" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="67" y1="15" x2="67" y2="45" stroke="oklch(0.68 0.17 35)" strokeWidth="0.3" strokeDasharray="1,1" />

            <text x="15" y="12" fontSize="3" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              المركز الأيسر
            </text>
            <text x="50" y="12" fontSize="3" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              المركز الأوسط
            </text>
            <text x="85" y="12" fontSize="3" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
              مركز أمان المحرك
            </text>

            {routers.map(router => (
              <g key={router.id}>
                <circle
                  cx={router.position.x}
                  cy={router.position.y}
                  r={router.range}
                  fill="oklch(0.72 0.15 50 / 0.1)"
                  stroke="oklch(0.72 0.15 50 / 0.3)"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                />
                
                <g className="cursor-pointer" onClick={() => setSelectedRouter(router.ssid)}>
                  <circle
                    cx={router.position.x}
                    cy={router.position.y}
                    r="2.5"
                    fill="oklch(0.72 0.15 50)"
                    className="pulse-dot"
                  />
                  <circle
                    cx={router.position.x}
                    cy={router.position.y}
                    r="1.5"
                    fill="white"
                  />
                </g>
              </g>
            ))}

            {filteredLocations.map((location, idx) => {
              const statusColor = location.status === 'late' 
                ? 'oklch(0.68 0.17 35)' 
                : 'oklch(0.65 0.18 145)';
              
              return (
                <g key={location.employeeId} className="employee-marker">
                  <circle
                    cx={location.position.x}
                    cy={location.position.y}
                    r="1.8"
                    fill={statusColor}
                    stroke="white"
                    strokeWidth="0.3"
                    className="transition-all duration-300"
                    style={{
                      animation: `pulse 2s ease-in-out infinite ${idx * 0.2}s`
                    }}
                  />
                  <circle
                    cx={location.position.x}
                    cy={location.position.y}
                    r="1"
                    fill="white"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-3 h-3 rounded-full bg-primary pulse-dot" />
            <span className="text-xs sm:text-sm">راوتر واي فاي</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs sm:text-sm">حاضر</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs sm:text-sm">متأخر</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {routers.map(router => {
          const routerEmployees = getRouterEmployees(router.ssid);
          return (
            <Card key={router.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <WifiHigh size={20} weight="fill" className="text-primary" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{router.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{router.ssid}</p>
                </div>
                <Badge>{routerEmployees.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {routerEmployees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    لا يوجد موظفين متصلين
                  </p>
                ) : (
                  routerEmployees.map(loc => (
                    <div key={loc.employeeId} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={loc.employee.avatar} />
                        <AvatarFallback className="text-xs">
                          {loc.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{loc.employee.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {loc.employee.department}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        loc.status === 'late' ? 'bg-accent' : 'bg-success'
                      }`} />
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
