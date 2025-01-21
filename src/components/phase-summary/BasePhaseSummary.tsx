import { type FC, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PhaseStatusInfo } from '@/types/phase-summary';

interface Props {
  title: string;
  description: string;
  phaseStatus: PhaseStatusInfo;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  proposalList: ReactNode;
  stats?: ReactNode;
}

export const BasePhaseSummary: FC<Props> = ({
  title,
  description,
  phaseStatus,
  leftColumn,
  rightColumn,
  proposalList,
  stats
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <Badge 
              variant={phaseStatus.badge}
              className={cn(
                "capitalize",
                phaseStatus.status === 'ended' ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-800"
              )}
            >
              <TimerIcon className="w-3 h-3 mr-1" />
              {phaseStatus.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {stats}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr,2fr]">
        <div className="space-y-4">
          {leftColumn}
        </div>
        {rightColumn}
      </div>

      {proposalList}
    </div>
  );
}; 