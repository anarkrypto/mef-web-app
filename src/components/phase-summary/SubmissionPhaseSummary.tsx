import { type FC } from 'react'
import { FileTextIcon, CalendarIcon } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { type SubmissionPhaseSummary as SubmissionPhaseSummaryType } from '@/types/phase-summary'
import {
	getPhaseStatus,
	getPhaseProgress,
	getProgressColor,
} from '@/lib/phase-utils'
import { BasePhaseSummary } from './BasePhaseSummary'
import { PhaseTimeCard } from './PhaseTimeCard'
import { ProposalList } from './ProposalList'
import { BudgetDistributionChart } from '../funding-rounds/BudgetDistributionChart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Props {
	summary: SubmissionPhaseSummaryType
}

const SubmissionStatusCard: FC<{ submittedCount: number }> = ({
	submittedCount,
}) => {
	return (
		<Card className="h-[200px]">
			<CardHeader className="flex flex-row items-center justify-between py-2">
				<CardTitle className="flex items-center gap-2 text-sm font-medium">
					<FileTextIcon className="h-4 w-4 text-muted-foreground" />
					Submission Status
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col items-center justify-center space-y-2 pt-4">
					<div className="text-4xl font-bold text-primary">
						{submittedCount}
					</div>
					<div className="text-sm text-muted-foreground">
						Proposals Submitted
					</div>
					<div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
						<CalendarIcon className="h-4 w-4" />
						<span>All submitted proposals will be reviewed</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export const SubmissionPhaseSummary: FC<Props> = ({ summary }) => {
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
				title={`${summary.fundingRoundName}'s Submission Phase Summary`}
				description="Overview of the submission phase progress and submitted proposals"
				phaseStatus={phaseStatus}
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
						/>
						<SubmissionStatusCard submittedCount={summary.submittedProposals} />
					</>
				}
				rightColumn={
					<BudgetDistributionChart budgetBreakdown={summary.budgetBreakdown} />
				}
				proposalList={
					<ProposalList
						title="Submitted Proposals"
						proposals={summary.proposalVotes}
						showCommunityVotes={false}
					/>
				}
			/>
		</TooltipProvider>
	)
}
