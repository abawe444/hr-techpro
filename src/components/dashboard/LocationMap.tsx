import { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WifiHigh, Image as ImageIcon, Trash } from '@phosphor-icons/react';
import type { Employee, AttendanceRecord, WiFiRouter, EmployeeLocation } from '@/lib/types';

interface LocationMapProps {
  employees: Employee[];
  todayAttendance: AttendanceRecord[];
  routers: WiFiRouter[];
}

export function LocationMap({ employees, todayAttendance, routers }: LocationMapProps) {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);
  const [mapImage, setMapImage] = useKV<string>('map_background_image', '');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            x: router.position.x + distance * Math.cos(angle),
            y: router.position.y + distance * Math.sin(angle)
          },
          wifiNetwork: record.wifiNetwork || router.ssid,
          status: record.isLate ? 'late' : 'present',
          lastUpdate: new Date().toISOString()
        };
        
        return location;
      })
      .filter((loc): loc is EmployeeLocation => loc !== null);

    setEmployeeLocations(presentEmployees);

    const interval = setInterval(() => {
      setEmployeeLocations(current => 
        current.map(loc => {
          const router = routers.find(r => r.ssid === loc.wifiNetwork) || routers[0];
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * (router.range - 3);
          
          return {
            ...loc,
            position: {
              x: router.position.x + distance * Math.cos(angle),
              y: router.position.y + distance * Math.sin(angle)
            }
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [employees, todayAttendance, routers]);

  const getRouterEmployees = (ssid: string) => {
    return employeeLocations.filter(loc => loc.wifiNetwork === ssid);
  };

  const filteredLocations = selectedRouter 
    ? employeeLocations.filter(loc => loc.wifiNetwork === selectedRouter)
    : employeeLocations;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMapImage(() => result);
        toast.success('تم رفع صورة الخريطة بنجاح');
      }
    };
    reader.onerror = () => {
      toast.error('فشل تحميل الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setMapImage(() => '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('تم حذف صورة الخريطة');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">تتبع موقع الموظفين</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">مواقع الموظفين الحاليين على الخريطة حسب شبكة الواي فاي</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="map-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <ImageIcon size={16} className="ml-1" />
              <span className="hidden sm:inline">رفع خريطة</span>
              <span className="sm:hidden">خريطة</span>
            </Button>
            {mapImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                className="flex-shrink-0"
              >
                <Trash size={16} className="ml-1" />
                <span className="hidden sm:inline">حذف</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
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

        <p className="text-xs text-muted-foreground mb-2 sm:hidden">👆 اضغط على الخريطة لتكبيرها</p>

        <div 
          className="relative bg-muted rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg" 
          style={{ paddingBottom: isMapExpanded ? '80%' : '60%' }}
          onClick={() => setIsMapExpanded(!isMapExpanded)}
        >
          {mapImage && (
            <img 
              src={mapImage} 
              alt="خريطة المراكز" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid meet"
          >
            {!mapImage && (
              <>
                <rect x="2" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
                <rect x="35" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
                <rect x="68" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />

                <line x1="2" y1="15" x2="32" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />
                <line x1="35" y1="15" x2="65" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />
                <line x1="68" y1="15" x2="98" y2="15" stroke="oklch(0.88 0.01 80)" strokeWidth="0.2" />

                <text x="17" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                  ---
                </text>
                <text x="50" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                  --
                </text>
                <text x="83" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                  -
                </text>
              </>
            )}

            {routers.map(router => {
              const signalColor = router.signalColor || 'oklch(0.72 0.15 50)';
              const signalOpacity = router.signalOpacity || 0.3;
              const signalPattern = router.signalPattern || 'solid';
              const signalRings = router.signalRings || 3;
              
              const renderSignalRings = () => {
                const rings: React.ReactNode[] = [];
                for (let i = 1; i <= signalRings; i++) {
                  const radius = (router.range / signalRings) * i;
                  const opacity = signalOpacity * (1 - (i - 1) / signalRings);
                  
                  let strokeDasharray = '0';
                  if (signalPattern === 'dashed') strokeDasharray = '2,2';
                  if (signalPattern === 'dotted') strokeDasharray = '0.5,1.5';
                  if (signalPattern === 'waves') strokeDasharray = '3,1.5,1,1.5';
                  
                  rings.push(
                    <circle
                      key={`${router.id}-ring-${i}`}
                      cx={router.position.x}
                      cy={router.position.y}
                      r={radius}
                      fill={signalPattern === 'solid' ? `${signalColor} / ${opacity}` : 'none'}
                      stroke={signalPattern === 'solid' ? `${signalColor} / ${opacity * 0.5}` : `${signalColor} / ${opacity}`}
                      strokeWidth={signalPattern === 'solid' ? '0.2' : '0.4'}
                      strokeDasharray={strokeDasharray}
                    />
                  );
                }
                return rings;
              };

              return (
                <g key={router.id}>
                  {renderSignalRings()}
                  
                  {router.customImage ? (
                    <image
                      href={router.customImage}
                      x={router.position.x - 2}
                      y={router.position.y - 2}
                      width="4"
                      height="4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : (
                    <>
                      <circle
                        cx={router.position.x}
                        cy={router.position.y}
                        r="2"
                        fill={signalColor}
                        className="pulse-dot"
                      />
                      <circle
                        cx={router.position.x}
                        cy={router.position.y}
                        r="1"
                        fill="white"
                      />
                    </>
                  )}
                  
                  <text 
                    x={router.position.x} 
                    y={router.position.y - router.range - 2} 
                    fontSize="2.5" 
                    fill={mapImage ? 'white' : 'oklch(0.09 0.005 286)'} 
                    textAnchor="middle" 
                    fontWeight="700"
                    stroke={mapImage ? 'oklch(0.09 0.005 286)' : 'none'}
                    strokeWidth={mapImage ? '0.3' : '0'}
                  >
                    {router.name}
                  </text>
                </g>
              );
            })}

            {filteredLocations.map((location, index) => {
              const statusColor = location.status === 'late' ? 'oklch(0.68 0.17 35)' : 'oklch(0.65 0.18 145)';
              const initials = location.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2);
              
              return (
                <g key={location.employeeId} className="employee-marker">
                  <circle
                    cx={location.position.x}
                    cy={location.position.y}
                    r="3.5"
                    fill={statusColor}
                    opacity="0.25"
                    className="pulse-dot"
                  />
                  <circle
                    cx={location.position.x}
                    cy={location.position.y}
                    r="2"
                    fill={statusColor}
                    stroke="white"
                    strokeWidth="0.3"
                  />
                  <text
                    x={location.position.x}
                    y={location.position.y + 0.7}
                    fontSize="1.2"
                    fill="white"
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    {initials}
                  </text>
                  <title>{location.employee.name} - {location.employee.department}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success"></div>
              <span className="text-xs sm:text-sm font-semibold">في الوقت</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-success">
              {employeeLocations.filter(l => l.status === 'present').length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent"></div>
              <span className="text-xs sm:text-sm font-semibold">متأخرون</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-accent">
              {employeeLocations.filter(l => l.status === 'late').length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary"></div>
              <span className="text-xs sm:text-sm font-semibold">الإجمالي</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {employeeLocations.length}
            </p>
          </div>
        </div>

        {filteredLocations.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
              الموظفون الحاليون
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {filteredLocations.length}
              </span>
            </h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto p-1">
              {filteredLocations.map(location => {
                const ringColor = location.status === 'late' ? 'oklch(0.68 0.17 35)' : 'oklch(0.65 0.18 145)';
                const bgColor = location.status === 'late' ? 'oklch(0.68 0.17 35 / 0.15)' : 'oklch(0.65 0.18 145 / 0.15)';
                
                return (
                  <div
                    key={location.employeeId}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:scale-[1.02]"
                    style={{ borderColor: ringColor }}
                  >
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-offset-1 ring-current" style={{ color: ringColor }}>
                      <AvatarImage src={location.employee.avatar} />
                      <AvatarFallback className="text-xs sm:text-sm font-bold" style={{
                        backgroundColor: bgColor,
                        color: ringColor
                      }}>
                        {location.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold truncate">{location.employee.name}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                        <WifiHigh size={12} className="flex-shrink-0 text-muted-foreground" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {routers.find(r => r.ssid === location.wifiNetwork)?.name || location.wifiNetwork}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
