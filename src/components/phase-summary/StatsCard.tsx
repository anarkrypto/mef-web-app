import { type FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  icon: React.ReactNode;
  description: string;
  positiveCount: number;
  negativeCount: number;
  positiveLabel: string;
  negativeLabel: string;
  className?: string;
}

export const StatsCard: FC<Props> = ({
  title,
  icon,
  description,
  positiveCount,
  negativeCount,
  positiveLabel,
  negativeLabel,
  className
}) => {
  const total = positiveCount + negativeCount;
  const positivePercentage = total > 0 ? (positiveCount / total) * 100 : 0;

  return (
    <Card className={cn("h-[200px]", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="absolute inset-0 flex w-full">
              <div 
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${positivePercentage}%` }}
              />
              <div 
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${100 - positivePercentage}%` }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    {positiveCount}
                  </p>
                  <p className="text-xs text-muted-foreground">{positiveLabel}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of {positiveLabel.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div>
                  <p className="text-sm font-medium text-rose-600">
                    {negativeCount}
                  </p>
                  <p className="text-xs text-muted-foreground">{negativeLabel}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of {negativeLabel.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}; 