import { type FC } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PhaseTimeInfo, type PhaseStatusInfo } from '@/types/phase-summary';

interface Props {
  timeInfo: PhaseTimeInfo;
  phaseStatus: PhaseStatusInfo;
  className?: string;
}

export const PhaseTimeCard: FC<Props> = ({
  timeInfo,
  phaseStatus,
  className
}) => {
  // Calculate time progress
  const now = new Date();
  const totalDuration = differenceInSeconds(timeInfo.endDate, timeInfo.startDate);
  const elapsed = differenceInSeconds(now, timeInfo.startDate);
  const timeProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  return (
    <Card className={cn("h-[200px]", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          Phase Duration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="text-sm font-medium">
              {format(timeInfo.startDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(timeInfo.startDate, 'HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End</p>
            <p className="text-sm font-medium">
              {format(timeInfo.endDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(timeInfo.endDate, 'HH:mm')}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-center flex-1 text-right">{phaseStatus.text}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={cn(
                "h-full bg-gradient-to-r transition-all duration-500",
                phaseStatus.status === 'ended' ? phaseStatus.progressColor :
                timeProgress <= 33 ? "from-emerald-500 to-emerald-600" :
                timeProgress <= 66 ? "from-amber-500 to-amber-600" :
                "from-rose-500 to-rose-600"
              )}
              style={{ 
                width: phaseStatus.status === 'ended' ? '100%' : `${timeProgress}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 