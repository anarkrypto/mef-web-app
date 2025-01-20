import { type FC } from 'react';
import { CheckCircleIcon } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type DeliberationPhaseSummary as DeliberationPhaseSummaryType } from '@/types/phase-summary';
import { getPhaseStatus, getPhaseProgress, getProgressColor } from '@/lib/phase-utils';
import { BasePhaseSummary } from './BasePhaseSummary';
import { PhaseTimeCard } from './PhaseTimeCard';
import { StatsCard } from './StatsCard';
import { ProposalList } from './ProposalList';
import { BudgetDistributionChart } from '../funding-rounds/BudgetDistributionChart';

interface Props {
  summary: DeliberationPhaseSummaryType;
  fundingRoundId: string;
}

export const DeliberationPhaseSummary: FC<Props> = ({
  summary,
  fundingRoundId
}) => {
  const phaseStatus = getPhaseStatus(summary.phaseTimeInfo);
  const progress = getPhaseProgress(summary.phaseTimeInfo);
  const progressColor = getProgressColor(progress);

  // If phase hasn't started yet, show countdown widget
  if (phaseStatus.status === 'not-started') {
    return (
      <div className="container max-w-2xl mx-auto">
        <PhaseTimeCard
          timeInfo={summary.phaseTimeInfo}
          phaseStatus={phaseStatus}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <BasePhaseSummary
        title="Deliberation Phase Summary"
        description="Overview of the deliberation phase progress and reviewer recommendations"
        phaseStatus={phaseStatus}
        leftColumn={
          <>
            <PhaseTimeCard
              timeInfo={summary.phaseTimeInfo}
              phaseStatus={{
                ...phaseStatus,
                progressColor: phaseStatus.status === 'ended' ? phaseStatus.progressColor : progressColor
              }}
            />
            <StatsCard
              title="Reviewer Recommendations"
              icon={<CheckCircleIcon className="h-4 w-4 text-muted-foreground" />}
              description={`Out of ${summary.totalProposals} proposals, ${summary.recommendedProposals} are recommended by reviewers, while ${summary.notRecommendedProposals} are not recommended.`}
              positiveCount={summary.recommendedProposals}
              negativeCount={summary.notRecommendedProposals}
              positiveLabel="Recommended"
              negativeLabel="Not Recommended"
            />
          </>
        }
        rightColumn={
          <BudgetDistributionChart budgetBreakdown={summary.budgetBreakdown} />
        }
        proposalList={
          <ProposalList
            title="Ranked Proposals"
            proposals={summary.proposalVotes}
            showCommunityVotes={false}
          />
        }
      />
    </TooltipProvider>
  );
}; 