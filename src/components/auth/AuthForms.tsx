import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Envelope, IdentificationCard, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Employee } from '@/lib/types';

declare const spark: {
  user: () => Promise<{ email: string }>;
};

interface AuthFormsProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (employee: Omit<Employee, 'id' | 'isActive' | 'isPending'>) => void;
}

export function AuthForms({ onLogin, onRegister }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@hr-techpro.com');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    employeeId: '',
    rank: '',
    salary: '',
    department: '',
    role: 'employee' as const,
    region: ''
  });

  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const user = await spark.user();
        if (user.email) {
          setAdminEmail(user.email);
        }
      } catch {
        setAdminEmail('admin@hr-techpro.com');
      }
    };
    
    fetchAdminEmail();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }
      onLogin(formData.email, formData.password);
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.employeeId || !formData.department) {
        toast.error('يرجى إكمال جميع الحقول المطلوبة');
        return;
      }
      
      const newEmployee: Omit<Employee, 'id' | 'isActive' | 'isPending'> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        rank: formData.rank,
        salary: parseFloat(formData.salary) || 0,
        department: formData.department,
        role: formData.role,
        region: formData.region,
        vacationDays: 30,
        usedVacationDays: 0
      };
      
      onRegister(newEmployee);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-4">
        {isLogin && (
          <Alert className="bg-accent/10 border-accent">
            <Info size={20} className="text-accent" />
            <AlertDescription className="text-sm">
              <div className="font-semibold mb-2">معلومات تسجيل الدخول:</div>
              <div className="space-y-1 text-xs">
                <div><strong>المسؤول:</strong> {adminEmail}</div>
                <div><strong>كلمة المرور:</strong> admin123</div>
                <hr className="my-2 border-accent/20" />
                <div><strong>موظف تجريبي:</strong> ahmed.said@company.com</div>
                <div><strong>كلمة المرور:</strong> emp123</div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
              <UserCircle size={40} weight="fill" className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">HR-TechPro</h1>
            <p className="text-muted-foreground mt-2">نظام إدارة الموظفين والحضور</p>
          </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={isLogin ? 'default' : 'outline'}
            className={isLogin ? 'gradient-primary flex-1' : 'flex-1'}
            onClick={() => setIsLogin(true)}
          >
            تسجيل الدخول
          </Button>
          <Button
            variant={!isLogin ? 'default' : 'outline'}
            className={!isLogin ? 'gradient-primary flex-1' : 'flex-1'}
            onClick={() => setIsLogin(false)}
          >
            إنشاء حساب
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">الرقم الوظيفي *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="مثال: EMP001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rank">الرتبة</Label>
                  <Input
                    id="rank"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    placeholder="مثال: مهندس"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">القسم *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                    <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                    <SelectItem value="المبيعات">المبيعات</SelectItem>
                    <SelectItem value="التسويق">التسويق</SelectItem>
                    <SelectItem value="المالية">المالية</SelectItem>
                    <SelectItem value="العمليات">العمليات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">المنطقة/الموقع</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="مثال: الرياض"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full gradient-primary" size="lg">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </Button>

          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center">
              سيتم مراجعة طلبك من قبل المدير وستتلقى إشعاراً عند تفعيل حسابك
            </p>
          )}
        </form>
        </Card>
      </div>
    </div>
  );
}
