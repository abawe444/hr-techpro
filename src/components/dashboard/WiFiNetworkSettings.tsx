import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { RouterCustomization } from './RouterCustomization';
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
    icon: 'wifi',
    iconSize: 24,
    signalColor: 'oklch(0.72 0.15 50)',
    signalOpacity: 0.3,
    signalPattern: 'solid' as 'solid' | 'dashed' | 'dotted' | 'waves',
    signalRings: 3,
    customImage: '',
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
      icon: 'wifi',
      iconSize: 24,
      signalColor: 'oklch(0.72 0.15 50)',
      signalOpacity: 0.3,
      signalPattern: 'solid',
      signalRings: 3,
      customImage: '',
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
      icon: router.icon || 'wifi',
      iconSize: router.iconSize || 24,
      signalColor: router.signalColor || 'oklch(0.72 0.15 50)',
      signalOpacity: router.signalOpacity || 0.3,
      signalPattern: router.signalPattern || 'solid',
      signalRings: router.signalRings || 3,
      customImage: router.customImage || '',
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
              icon: routerForm.icon,
              iconSize: routerForm.iconSize,
              signalColor: routerForm.signalColor,
              signalOpacity: routerForm.signalOpacity,
              signalPattern: routerForm.signalPattern,
              signalRings: routerForm.signalRings,
              customImage: routerForm.customImage,
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
        icon: routerForm.icon,
        iconSize: routerForm.iconSize,
        signalColor: routerForm.signalColor,
        signalOpacity: routerForm.signalOpacity,
        signalPattern: routerForm.signalPattern,
        signalRings: routerForm.signalRings,
        customImage: routerForm.customImage,
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
      icon: 'wifi',
      iconSize: 24,
      signalColor: 'oklch(0.72 0.15 50)',
      signalOpacity: 0.3,
      signalPattern: 'solid',
      signalRings: 3,
      customImage: '',
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
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRouter ? 'تعديل بيانات الراوتر' : 'إضافة راوتر جديد'}</DialogTitle>
            <DialogDescription>
              {editingRouter ? 'قم بتحديث بيانات الراوتر وتخصيص شكله' : 'قم بإضافة راوتر جديد إلى الخريطة وتخصيصه'}
            </DialogDescription>
          </DialogHeader>
          
          <RouterCustomization
            routerForm={routerForm}
            onFormChange={(updates) => setRouterForm({ ...routerForm, ...updates })}
          />
          
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
