import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  WifiHigh,
  Buildings,
  MapPin,
  Circle,
  Waves,
  Broadcast,
} from '@phosphor-icons/react';

interface RouterCustomizationProps {
  routerForm: {
    name: string;
    ssid: string;
    zone: 'right' | 'center' | 'left';
    positionX: number;
    positionY: number;
    range: number;
    icon: string;
    iconSize: number;
    signalColor: string;
    signalOpacity: number;
    signalPattern: 'solid' | 'dashed' | 'dotted' | 'waves';
    signalRings: number;
    customImage: string;
  };
  onFormChange: (updates: Partial<RouterCustomizationProps['routerForm']>) => void;
}

const iconOptions = [
  { id: 'wifi', label: 'واي فاي', Icon: WifiHigh },
  { id: 'broadcast', label: 'راوتر', Icon: Broadcast },
  { id: 'building', label: 'مبنى', Icon: Buildings },
  { id: 'pin', label: 'دبوس', Icon: MapPin },
  { id: 'circle', label: 'دائرة', Icon: Circle },
];

const signalColors = [
  { id: 'primary', label: 'أساسي', value: 'oklch(0.72 0.15 50)' },
  { id: 'accent', label: 'تمييزي', value: 'oklch(0.68 0.17 35)' },
  { id: 'secondary', label: 'ثانوي', value: 'oklch(0.45 0.12 250)' },
  { id: 'success', label: 'أخضر', value: 'oklch(0.65 0.18 145)' },
  { id: 'blue', label: 'أزرق', value: 'oklch(0.55 0.22 250)' },
  { id: 'purple', label: 'بنفسجي', value: 'oklch(0.60 0.25 290)' },
  { id: 'red', label: 'أحمر', value: 'oklch(0.577 0.245 27.325)' },
];

export function RouterCustomization({ routerForm, onFormChange }: RouterCustomizationProps) {
  const [imagePreview, setImagePreview] = useState<string>(routerForm.customImage || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onFormChange({ customImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSignalPattern = () => {
    const rings: React.ReactNode[] = [];
    const baseColor = routerForm.signalColor;
    
    for (let i = 1; i <= routerForm.signalRings; i++) {
      const radius = (routerForm.range / routerForm.signalRings) * i;
      const opacity = routerForm.signalOpacity * (1 - (i - 1) / routerForm.signalRings);
      
      let strokeDasharray = '0';
      if (routerForm.signalPattern === 'dashed') strokeDasharray = '2,2';
      if (routerForm.signalPattern === 'dotted') strokeDasharray = '0.5,1.5';
      if (routerForm.signalPattern === 'waves') strokeDasharray = '3,1.5,1,1.5';
      
      rings.push(
        <circle
          key={`ring-${i}`}
          cx={routerForm.positionX}
          cy={routerForm.positionY}
          r={radius}
          fill={routerForm.signalPattern === 'solid' ? `${baseColor} / ${opacity}` : 'none'}
          stroke={routerForm.signalPattern === 'solid' ? `${baseColor} / ${opacity * 0.5}` : `${baseColor} / ${opacity}`}
          strokeWidth={routerForm.signalPattern === 'solid' ? '0.2' : '0.4'}
          strokeDasharray={strokeDasharray}
        />
      );
    }
    
    return rings;
  };

  const SelectedIcon = iconOptions.find(opt => opt.id === routerForm.icon)?.Icon || WifiHigh;

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic" className="text-xs">
          الأساسية
        </TabsTrigger>
        <TabsTrigger value="icon" className="text-xs">
          الأيقونة
        </TabsTrigger>
        <TabsTrigger value="signal" className="text-xs">
          الإشارة
        </TabsTrigger>
        <TabsTrigger value="preview" className="text-xs">
          معاينة
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="router-name">اسم المركز *</Label>
          <Input
            id="router-name"
            value={routerForm.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder="مثال: مركز أمان المحرك"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="router-ssid">اسم شبكة الواي فاي (SSID) *</Label>
          <Input
            id="router-ssid"
            value={routerForm.ssid}
            onChange={(e) => onFormChange({ ssid: e.target.value })}
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
            onChange={(e) => onFormChange({ zone: e.target.value as any })}
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
              onChange={(e) => onFormChange({ positionX: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => onFormChange({ positionY: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">من 0 إلى 60</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="router-range">نطاق التغطية: {routerForm.range} متر</Label>
          </div>
          <Slider
            id="router-range"
            min={5}
            max={30}
            step={1}
            value={[routerForm.range]}
            onValueChange={(value) => onFormChange({ range: value[0] })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            نطاق تغطية إشارة الواي فاي (الموصى به: 15 متر)
          </p>
        </div>
      </TabsContent>

      <TabsContent value="icon" className="space-y-4">
        <div className="space-y-2">
          <Label>شكل الأيقونة</Label>
          <div className="grid grid-cols-3 gap-2">
            {iconOptions.map((option) => {
              const Icon = option.Icon;
              return (
                <button
                  key={option.id}
                  onClick={() => onFormChange({ icon: option.id })}
                  className={`flex flex-col items-center gap-2 p-3 border rounded-lg hover:border-primary transition-colors ${
                    routerForm.icon === option.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <Icon size={24} weight={routerForm.icon === option.id ? 'fill' : 'regular'} />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>حجم الأيقونة: {routerForm.iconSize}px</Label>
          </div>
          <Slider
            min={16}
            max={48}
            step={2}
            value={[routerForm.iconSize]}
            onValueChange={(value) => onFormChange({ iconSize: value[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>رفع صورة مخصصة</Label>
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="relative w-full aspect-square max-w-32 border rounded-lg overflow-hidden">
                <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1"
                  onClick={() => {
                    setImagePreview('');
                    onFormChange({ customImage: '' });
                  }}
                >
                  حذف
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            سيتم استخدام الصورة المخصصة بدلاً من الأيقونة الافتراضية
          </p>
        </div>
      </TabsContent>

      <TabsContent value="signal" className="space-y-4">
        <div className="space-y-2">
          <Label>لون الإشارة</Label>
          <div className="grid grid-cols-2 gap-2">
            {signalColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onFormChange({ signalColor: color.value })}
                className={`flex items-center gap-2 p-2 border rounded-lg hover:border-primary transition-colors ${
                  routerForm.signalColor === color.value ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>شفافية الإشارة: {Math.round(routerForm.signalOpacity * 100)}%</Label>
          </div>
          <Slider
            min={0.1}
            max={0.8}
            step={0.05}
            value={[routerForm.signalOpacity]}
            onValueChange={(value) => onFormChange({ signalOpacity: value[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>نمط الإشارة</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFormChange({ signalPattern: 'solid' })}
              className={`p-3 border rounded-lg hover:border-primary transition-colors ${
                routerForm.signalPattern === 'solid' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-current rounded" />
                <span className="text-xs">صلب</span>
              </div>
            </button>
            <button
              onClick={() => onFormChange({ signalPattern: 'dashed' })}
              className={`p-3 border rounded-lg hover:border-primary transition-colors ${
                routerForm.signalPattern === 'dashed' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 border-t-2 border-dashed border-current" />
                <span className="text-xs">متقطع</span>
              </div>
            </button>
            <button
              onClick={() => onFormChange({ signalPattern: 'dotted' })}
              className={`p-3 border rounded-lg hover:border-primary transition-colors ${
                routerForm.signalPattern === 'dotted' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 border-t-2 border-dotted border-current" />
                <span className="text-xs">منقط</span>
              </div>
            </button>
            <button
              onClick={() => onFormChange({ signalPattern: 'waves' })}
              className={`p-3 border rounded-lg hover:border-primary transition-colors ${
                routerForm.signalPattern === 'waves' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Waves size={20} />
                <span className="text-xs">موجي</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>عدد دوائر الإشارة: {routerForm.signalRings}</Label>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[routerForm.signalRings]}
            onValueChange={(value) => onFormChange({ signalRings: value[0] })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            عدد الدوائر التي تمثل انتشار إشارة الواي فاي
          </p>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
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

              {renderSignalPattern()}

              {routerForm.customImage ? (
                <image
                  href={routerForm.customImage}
                  x={routerForm.positionX - 2}
                  y={routerForm.positionY - 2}
                  width="4"
                  height="4"
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : (
                <>
                  <circle
                    cx={routerForm.positionX}
                    cy={routerForm.positionY}
                    r="2"
                    fill={routerForm.signalColor}
                  />
                  <circle
                    cx={routerForm.positionX}
                    cy={routerForm.positionY}
                    r="1"
                    fill="white"
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">ملخص الإعدادات:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">الاسم:</span>
              <p className="font-semibold truncate">{routerForm.name || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">SSID:</span>
              <p className="font-mono font-semibold truncate">{routerForm.ssid || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">الموقع:</span>
              <p className="font-semibold">X:{routerForm.positionX}, Y:{routerForm.positionY}</p>
            </div>
            <div>
              <span className="text-muted-foreground">النطاق:</span>
              <p className="font-semibold">{routerForm.range} متر</p>
            </div>
            <div>
              <span className="text-muted-foreground">الأيقونة:</span>
              <p className="font-semibold">{iconOptions.find(o => o.id === routerForm.icon)?.label}</p>
            </div>
            <div>
              <span className="text-muted-foreground">النمط:</span>
              <p className="font-semibold">{routerForm.signalPattern}</p>
            </div>
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
      </TabsContent>
    </Tabs>
  );
}
