import { type FC } from 'react'
import { CoinsIcon } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { type VotingPhaseFundsDistributionSummary as VotingPhaseFundsDistributionSummaryType } from '@/types/phase-summary'
import {
	getPhaseStatus,
	getPhaseProgress,
	getProgressColor,
} from '@/lib/phase-utils'
import { BasePhaseSummary } from './BasePhaseSummary'
import { PhaseTimeCard } from './PhaseTimeCard'
import { StatsCard } from './StatsCard'
import { ProposalList } from './ProposalList'
import { BudgetDistributionChart } from '../funding-rounds/BudgetDistributionChart'
import { formatMINA } from '@/lib/format'

interface Props {
	summary: VotingPhaseFundsDistributionSummaryType
	fundingRoundId: string
}

export const VotingPhaseFundsDistributionSummary: FC<Props> = ({
	summary,
	fundingRoundId,
}) => {
	const phaseStatus = getPhaseStatus(summary.phaseTimeInfo)
	const progress = getPhaseProgress(summary.phaseTimeInfo)
	const progressColor = getProgressColor(progress)

	// If phase hasn't started yet, show countdown widget
	if (phaseStatus.status === 'not-started') {
		return (
			<div className="container mx-auto max-w-2xl">
				<PhaseTimeCard
					timeInfo={summary.phaseTimeInfo}
					phaseStatus={phaseStatus}
				/>
			</div>
		)
	}

	return (
		<TooltipProvider>
			<BasePhaseSummary
				title={`${summary.fundingRoundName}'s Funds Distribution Summary`}
				description="Overview of the funding distribution"
				phaseStatus={phaseStatus}
				stats={
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">Total Budget:</span>
							<span className="font-medium">
								{formatMINA(summary.totalBudget)} MINA
							</span>
							{summary.remainingBudget > 0 && (
								<>
									<span className="text-muted-foreground">•</span>
									<span className="font-medium text-emerald-600">
										Remaining: {formatMINA(summary.remainingBudget)} MINA
									</span>
								</>
							)}
						</div>
					</div>
				}
				leftColumn={
					<>
						<PhaseTimeCard
							timeInfo={summary.phaseTimeInfo}
							phaseStatus={{
								...phaseStatus,
								progressColor:
									phaseStatus.status === 'ended'
										? phaseStatus.progressColor
										: progressColor,
							}}
							className="transition-colors"
						/>
						<StatsCard
							title="Funding Status"
							icon={<CoinsIcon className="h-4 w-4 text-muted-foreground" />}
							description={`Out of ${summary.totalProposals} proposals, ${summary.fundedProposals} are fully funded, while ${summary.notFundedProposals} could not be funded.`}
							positiveCount={summary.fundedProposals}
							negativeCount={summary.notFundedProposals}
							positiveLabel="Funded"
							negativeLabel="Not Funded"
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
	)
}
