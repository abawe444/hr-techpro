import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage
import { Button } from '@/components/ui/button';
import type { Employee, AttendanceRecord, WiFi
import { Button } from '@/components/ui/button';
  employees: Employee[];
  routers: WiFiRouter[];


interface LocationMapProps {
  employees: Employee[];
  todayAttendance: AttendanceRecord[];
}

const WIFI_ROUTERS: WiFiRouter[] = [
  {
    id: 'router_1',
    name: 'مركز أمان المحرك',
    ssid: 'HR-TechPro-Right',
    zone: 'right',
    position: { x: 85, y: 45 },
    range: 15
    
  {
    id: 'router_2',
    name: 'المركز الأوسط',
    ssid: 'HR-TechPro-Center',
    zone: 'center',
          const newX = router.p
    range: 15
  },
  {
            }
    name: 'المركز الأيسر',
    }, 3000);
    zone: 'left',

    return em

  

    <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">


          <Button
            size="sm"

            الكل ({employeeLocations.length
          {routers.map(router => (
              key={router.id}
              size="sm"
              className="flex-shrink-0 text-xs"
          
            </Button>
        </div>
        <div className="relative bg-muted rounded-lg overflow-hidde
            className="absolute inset-0 w-full h-full"

            <rect x="2" y=
            <line x1="35" y1="15" x2

              المركز الأيسر
            <text x="50" y="12" fontS
            </text>
              مركز أمان المحرك

         
       
       

    setEmployeeLocations(locations);

    const interval = setInterval(() => {
      setEmployeeLocations(prevLocations => 
        prevLocations.map(loc => {
          const router = WIFI_ROUTERS.find(r => r.ssid === loc.wifiNetwork);
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
  }, [employees, todayAttendance]);

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
          {WIFI_ROUTERS.map(router => (
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















































































































































