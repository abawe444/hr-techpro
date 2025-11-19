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
  });

  const handleEditRouter = (router: WiFiRouter) => {
    setEditingRouter(router);
    setRouterForm({
      name: router.name,
      ssid: router.ssid,
    });
    setShowEditDialog(true);
  };

  const handleSaveRouter = () => {
    if (!routerForm.name.trim() || !routerForm.ssid.trim()) {
      toast.error('يرجى إكمال جميع الحقول');
      return;
    }

    if (editingRouter) {
      const updatedRouters = routers.map(r =>
        r.id === editingRouter.id
          ? { ...r, name: routerForm.name, ssid: routerForm.ssid }
          : r
      );
      onUpdateRouters(updatedRouters);
      toast.success('تم تحديث بيانات الراوتر بنجاح');
    }

    setShowEditDialog(false);
    setEditingRouter(null);
    setRouterForm({ name: '', ssid: '' });
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
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2">إعدادات شبكات الواي فاي</h3>
          <p className="text-sm text-muted-foreground">
            قم بتحديد أسماء شبكات الواي فاي المخولة لتسجيل الحضور في كل مركز
          </p>
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditRouter(router)}
                className="w-full sm:w-auto"
              >
                <PencilSimple size={16} className="ml-1" />
                تعديل
              </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الراوتر</DialogTitle>
            <DialogDescription>
              قم بتحديث اسم المركز واسم شبكة الواي فاي
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveRouter} className="gradient-primary">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
