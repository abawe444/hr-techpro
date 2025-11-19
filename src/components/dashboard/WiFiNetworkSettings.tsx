import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WifiHigh, Plus, Trash, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { WiFiRouter } from '@/lib/types';

interface WiFiNetworkSettingsProps {
  routers: WiFiRouter[];
  onUpdateRouters: (routers: WiFiRouter[]) => void;
}

export function WiFiNetworkSettings({ routers, onUpdateRouters }: WiFiNetworkSettingsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRouter, setEditingRouter] = useState<WiFiRouter | null>(null);
  const [routerForm, setRouterForm] = useState({
    name: '',
    ssid: '',
    zone: 'center' as 'right' | 'center' | 'left',
    positionX: 50,
    positionY: 45,
    range: 15,
  });

  const handleAddRouter = () => {
    setEditingRouter(null);
    setRouterForm({
      name: '',
      ssid: '',
      zone: 'center',
      positionX: 50,
      positionY: 45,
      range: 15,
    });
    setShowEditDialog(true);
  };

  const handleEditRouter = (router: WiFiRouter) => {
    setEditingRouter(router);
    setRouterForm({
      name: router.name,
      ssid: router.ssid,
      zone: router.zone,
      positionX: router.position.x,
      positionY: router.position.y,
      range: router.range,
    });
    setShowEditDialog(true);
  };

  const handleDeleteRouter = (routerId: string) => {
    if (routers.length <= 1) {
      toast.error('يجب أن يكون هناك راوتر واحد على الأقل');
      return;
    }
    
    const updatedRouters = routers.filter(r => r.id !== routerId);
    onUpdateRouters(updatedRouters);
    toast.success('تم حذف الراوتر بنجاح');
  };

  const handleSaveRouter = () => {
    if (!routerForm.name.trim() || !routerForm.ssid.trim()) {
      toast.error('يرجى إكمال جميع الحقول');
      return;
    }

    if (editingRouter) {
      const updatedRouters = routers.map(r =>
        r.id === editingRouter.id
          ? { 
              ...r, 
              name: routerForm.name, 
              ssid: routerForm.ssid,
              zone: routerForm.zone,
              position: { x: routerForm.positionX, y: routerForm.positionY },
              range: routerForm.range,
            }
          : r
      );
      onUpdateRouters(updatedRouters);
      toast.success('تم تحديث بيانات الراوتر بنجاح');
    } else {
      const newRouter: WiFiRouter = {
        id: `router_${Date.now()}`,
        name: routerForm.name,
        ssid: routerForm.ssid,
        zone: routerForm.zone,
        position: { x: routerForm.positionX, y: routerForm.positionY },
        range: routerForm.range,
      };
      onUpdateRouters([...routers, newRouter]);
      toast.success('تم إضافة الراوتر بنجاح');
    }

    setShowEditDialog(false);
    setEditingRouter(null);
    setRouterForm({
      name: '',
      ssid: '',
      zone: 'center',
      positionX: 50,
      positionY: 45,
      range: 15,
    });
  };

  const getZoneName = (zone: string) => {
    switch (zone) {
      case 'right':
        return 'المركز الأيمن';
      case 'center':
        return 'المركز الأوسط';
      case 'left':
        return 'المركز الأيسر';
      default:
        return zone;
    }
  };

  return (
    <>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">إعدادات شبكات الواي فاي</h3>
            <p className="text-sm text-muted-foreground">
              قم بتحديد أسماء شبكات الواي فاي المخولة لتسجيل الحضور في كل مركز
            </p>
          </div>
          <Button onClick={handleAddRouter} className="gradient-primary w-full sm:w-auto flex-shrink-0">
            <Plus size={18} className="ml-2" />
            إضافة راوتر جديد
          </Button>
        </div>

        <div className="space-y-3">
          {routers.map((router) => (
            <div
              key={router.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <WifiHigh size={20} weight="fill" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm sm:text-base truncate">{router.name}</h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {getZoneName(router.zone)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">اسم الشبكة:</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {router.ssid}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      نطاق التغطية: {router.range} متر
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditRouter(router)}
                  className="flex-1 sm:flex-initial"
                >
                  <PencilSimple size={16} className="ml-1" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteRouter(router.id)}
                  className="flex-1 sm:flex-initial"
                  disabled={routers.length <= 1}
                >
                  <Trash size={16} className="ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">ملاحظة هامة:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>يجب أن يكون اسم الشبكة (SSID) مطابقاً تماماً لاسم شبكة الواي فاي في المركز</li>
            <li>يمكن للموظفين تسجيل الحضور فقط عند الاتصال بإحدى هذه الشبكات المخولة</li>
            <li>تأكد من تحديث أسماء الشبكات في حال تغييرها في أجهزة الراوتر</li>
          </ul>
        </div>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRouter ? 'تعديل بيانات الراوتر' : 'إضافة راوتر جديد'}</DialogTitle>
            <DialogDescription>
              {editingRouter ? 'قم بتحديث بيانات الراوتر' : 'قم بإضافة راوتر جديد إلى الخريطة'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="router-name">اسم المركز *</Label>
              <Input
                id="router-name"
                value={routerForm.name}
                onChange={(e) => setRouterForm({ ...routerForm, name: e.target.value })}
                placeholder="مثال: مركز أمان المحرك"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="router-ssid">اسم شبكة الواي فاي (SSID) *</Label>
              <Input
                id="router-ssid"
                value={routerForm.ssid}
                onChange={(e) => setRouterForm({ ...routerForm, ssid: e.target.value })}
                placeholder="مثال: HR-TechPro-Center"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                يجب أن يكون مطابقاً تماماً لاسم الشبكة في جهاز الراوتر
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="router-zone">المنطقة *</Label>
              <select
                id="router-zone"
                value={routerForm.zone}
                onChange={(e) => setRouterForm({ ...routerForm, zone: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="right">مركز أمان المحرك (يمين)</option>
                <option value="center">المركز الأوسط</option>
                <option value="left">المركز الأيسر</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="router-x">الموقع الأفقي (X)</Label>
                <Input
                  id="router-x"
                  type="number"
                  min="0"
                  max="100"
                  value={routerForm.positionX}
                  onChange={(e) => setRouterForm({ ...routerForm, positionX: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">من 0 إلى 100</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="router-y">الموقع العمودي (Y)</Label>
                <Input
                  id="router-y"
                  type="number"
                  min="0"
                  max="60"
                  value={routerForm.positionY}
                  onChange={(e) => setRouterForm({ ...routerForm, positionY: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">من 0 إلى 60</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="router-range">نطاق التغطية (بالمتر)</Label>
              <Input
                id="router-range"
                type="number"
                min="5"
                max="30"
                value={routerForm.range}
                onChange={(e) => setRouterForm({ ...routerForm, range: parseFloat(e.target.value) || 15 })}
              />
              <p className="text-xs text-muted-foreground">
                نطاق تغطية إشارة الواي فاي (الموصى به: 15 متر)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>معاينة موقع الراوتر على الخريطة</Label>
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ paddingBottom: '60%' }}>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 60"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect x="2" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
                  <rect x="35" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />
                  <rect x="68" y="10" width="30" height="45" fill="oklch(0.95 0.01 80)" stroke="oklch(0.72 0.15 50)" strokeWidth="0.3" rx="1" />

                  <text x="17" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                    المركز الأيسر
                  </text>
                  <text x="50" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                    المركز الأوسط
                  </text>
                  <text x="83" y="12" fontSize="2.5" fill="oklch(0.50 0.02 50)" textAnchor="middle" fontWeight="600">
                    مركز أمان المحرك
                  </text>

                  <circle
                    cx={routerForm.positionX}
                    cy={routerForm.positionY}
                    r={routerForm.range}
                    fill="oklch(0.72 0.15 50 / 0.1)"
                    stroke="oklch(0.72 0.15 50 / 0.3)"
                    strokeWidth="0.2"
                    strokeDasharray="1,1"
                  />
                  <circle
                    cx={routerForm.positionX}
                    cy={routerForm.positionY}
                    r="2"
                    fill="oklch(0.72 0.15 50)"
                  />
                  <circle
                    cx={routerForm.positionX}
                    cy={routerForm.positionY}
                    r="1"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">مواقع افتراضية للمراكز:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• المركز الأيسر: X=15, Y=45</p>
                <p>• المركز الأوسط: X=50, Y=45</p>
                <p>• مركز أمان المحرك (يمين): X=85, Y=45</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveRouter} className="gradient-primary">
              {editingRouter ? 'حفظ التغييرات' : 'إضافة الراوتر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
