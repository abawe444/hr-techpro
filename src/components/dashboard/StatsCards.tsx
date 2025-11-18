import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserMinus, Clock } from '@phosphor-icons/react';
import type { AttendanceStats } from '@/lib/types';

interface StatsCardsProps {
  stats: AttendanceStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-muted">
              <Users size={24} className="text-foreground" />
            </div>
            <Badge variant="secondary">{stats.total}</Badge>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-success/10">
              <UserCheck size={24} className="text-success" weight="fill" />
            </div>
            <Badge className="bg-success text-success-foreground">{stats.present}</Badge>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">حاضر</p>
            <p className="text-2xl font-bold text-success">{stats.present}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-accent/10">
              <Clock size={24} className="text-accent" weight="fill" />
            </div>
            <Badge className="bg-accent text-accent-foreground">{stats.late}</Badge>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">متأخر</p>
            <p className="text-2xl font-bold text-accent">{stats.late}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-destructive/10">
              <UserMinus size={24} className="text-destructive" weight="fill" />
            </div>
            <Badge variant="destructive">{stats.absent}</Badge>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">غائب</p>
            <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
