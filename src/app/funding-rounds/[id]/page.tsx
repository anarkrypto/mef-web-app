'use client'

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
	FundingRoundPhase,
	FundingRoundWithPhases,
} from '@/types/funding-round'
import { CompletedPhase } from '@/components/phases/CompletedPhase'
import { VotingPhase } from '@/components/phases/VotingPhase'
import { DeliberationPhase } from '@/components/phases/DeliberationPhase'
import { ConsiderationProposalList } from '@/components/ConsiderationProposalList'
import { SubmissionProposalList } from '@/components/phases/SubmissionProposalList'
import { BetweenPhases } from '@/components/phases/BetweenPhases'
import { useFundingRound } from '@/hooks/use-funding-round'
import { CircleHelpIcon } from 'lucide-react'

type StartedPhase = Exclude<FundingRoundPhase, 'UPCOMING'>

const STARTED_PHASES: StartedPhase[] = [
	'SUBMISSION',
	'CONSIDERATION',
	'DELIBERATION',
	'VOTING',
	'COMPLETED',
]

type StartedFundingRoundWithPhases = Omit<FundingRoundWithPhases, 'phase'> & {
	phase: StartedPhase
}

type FundingRoundDashboardProps = {
	params: { id: string }
}

export default function FundingRoundDashboard({
	params,
}: FundingRoundDashboardProps) {
	const { data: untypedData, isLoading } = useFundingRound(params.id)

	if (untypedData?.phase === 'UPCOMING') {
		return <div>Upcoming</div>
	}

	const data = untypedData as StartedFundingRoundWithPhases

	if (isLoading || !data) {
		return <div>Loading...</div>
	}

	return (
		<div className="container mx-auto max-w-7xl p-6">
			<div className="space-y-8">
				{/* Status Overview */}
				<FundingRoundStatusOverviewCard data={data} />

				{/* Main Content */}
				<div className="grid grid-cols-[200px,1fr] gap-8">
					{/* Phase Progress */}
					<PhaseTimeline data={data} />

					{/* Content Area */}
					<div className="space-y-4">
						<FundingRoundHeaderCard phase={data.phase} />

						<FundingRoundPhaseComponent data={data} />
					</div>
				</div>

				{/* Help Link */}
				<footer className="flex justify-end">
					<Link
						href="/start-here"
						className="flex items-center gap-1 text-accent hover:underline"
					>
						<CircleHelpIcon className="h-4 w-4" /> Feeling lost? Check Start
						Here Section
					</Link>
				</footer>
			</div>
		</div>
	)
}

function FundingRoundHeaderCard({ phase }: { phase: StartedPhase }) {
	const data: Record<
		StartedPhase,
		{
			title: string
			description: string
		}
	> = {
		SUBMISSION: {
			title: '📝 Submission Phase',
			description:
				'Submit your proposals for this funding round. Review other submissions and provide feedback.',
		},
		CONSIDERATION: {
			title: '🤔 Consideration Phase',
			description:
				'Review submitted proposals and determine which ones you find valuable enough to receive funding.',
		},
		DELIBERATION: {
			title: '💭 Deliberation Phase',
			description:
				'Discuss and refine proposals with the community before final voting.',
		},
		VOTING: {
			title: '🗳️ Voting Phase',
			description:
				'Cast your votes to determine which proposals will receive funding.',
		},
		COMPLETED: {
			title: '🏁 Funding Round Completed',
			description: 'This funding round has been completed.',
		},
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{data[phase].title}</CardTitle>
				<CardDescription>{data[phase].description}</CardDescription>
			</CardHeader>
		</Card>
	)
}

function FundingRoundStatusOverviewCard({
	data,
}: {
	data: StartedFundingRoundWithPhases
}) {
	const endDate =
		data.phase === 'COMPLETED'
			? new Date(data.endDate)
			: new Date((data.phases as any)[data.phase].endDate)

	return (
		<Card className="bg-muted/50">
			<CardContent className="pt-6">
				<h2 className="mb-4 text-xl font-semibold">📊 Funding Round Status</h2>
				<div className="grid grid-cols-4 gap-4 text-center">
					<div>
						<div className="text-4xl font-bold">📝 {data.proposalsCount}</div>
						<div className="text-sm text-muted-foreground">
							Proposals Submitted
						</div>
					</div>
					<div>
						<div className="text-4xl font-bold">💰 {data.totalBudget}</div>
						<div className="text-sm text-muted-foreground">
							Total $MINA Funding
						</div>
					</div>
					<div>
						<div className="text-4xl font-bold">
							{getTimeRemainingWithEmoji(new Date(data.endDate)).emoji}{' '}
							{getTimeRemainingWithEmoji(new Date(data.endDate)).text}
						</div>
						<div className="text-sm text-muted-foreground">Until End</div>
					</div>
					<div>
						<div className="text-4xl font-bold">
							{getTimeRemainingWithEmoji(endDate).emoji}
							{getTimeRemainingWithEmoji(endDate).text}
						</div>
						<div className="text-sm text-muted-foreground">
							In {data.phase} Phase
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function PhaseTimeline({ data }: { data: StartedFundingRoundWithPhases }) {
	return (
		<div className="space-y-4">
			{STARTED_PHASES.map((phase, index) => {
				const isActive = data.phase === phase
				const isCompleted =
					data.phase === 'COMPLETED' ||
					index < STARTED_PHASES.indexOf(data.phase)

				return (
					<div key={phase as string} className="relative">
						{/* Timeline connector */}
						{index > 0 && (
							<div
								className={cn(
									'absolute -top-4 left-4 h-4 w-0.5',
									isCompleted ? 'bg-accent' : 'bg-muted-foreground/20',
								)}
							/>
						)}

						<div
							className={cn(
								'relative rounded-md p-3 font-medium capitalize',
								isCompleted && 'bg-accent/10 text-accent',
								isActive && 'bg-accent text-accent-foreground',
								!isActive && !isCompleted && 'text-muted-foreground',
							)}
						>
							{/* Phase icon */}
							<span className="mr-2">
								{phase === 'SUBMISSION' && '📝'}
								{phase === 'CONSIDERATION' && '🤔'}
								{phase === 'DELIBERATION' && '💭'}
								{phase === 'VOTING' && '🗳️'}
								{phase === 'COMPLETED' && '🏁'}
							</span>

							{/* Phase name */}
							{phase}

							{/* Completion indicator */}
							{isCompleted && (
								<span className="absolute right-2 top-1/2 -translate-y-1/2 text-accent">
									✓
								</span>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}

function FundingRoundPhaseComponent({
	data,
}: {
	data: FundingRoundWithPhases
}) {
	// If we're between phases, render the BetweenPhases component
	// TODO: I hope we can remove the possibility of between phases, otherwise we need to consider moving this logic to backend
	if (data.phase === null) {
		const now = new Date()

		const destructuredPhases = Object.entries(data.phases).map(
			([name, { startDate }], index) => ({
				index,
				name,
				startDate,
			}),
		)

		const nextPhase = destructuredPhases.find(
			({ startDate }) => new Date(startDate) > now,
		)

		if (nextPhase) {
			// Find the previous phase for context
			const previousPhase =
				nextPhase.index > 0 ? destructuredPhases[nextPhase.index - 1] : null

			return (
				<BetweenPhases
					currentPhase={previousPhase?.name ?? null}
					nextPhaseStart={nextPhase.startDate}
					nextPhaseName={nextPhase.name}
				/>
			)
		}
	}

	// Regular phase rendering
	switch (data.phase) {
		case 'SUBMISSION':
			return (
				<SubmissionProposalList
					fundingRoundId={data.id}
					fundingRoundName={data.name}
				/>
			)
		case 'CONSIDERATION':
			return (
				<ConsiderationProposalList
					fundingRoundId={data.id}
					fundingRoundMEFId={data.mefId}
					fundingRoundName={data.name}
				/>
			)
		case 'DELIBERATION':
			return (
				<DeliberationPhase
					fundingRoundId={data.id}
					fundingRoundName={data.name}
				/>
			)
		case 'VOTING':
			return (
				<VotingPhase fundingRoundId={data.id} fundingRoundName={data.name} />
			)
		case 'COMPLETED':
			return <CompletedPhase />
		default:
			return null
	}
}

const getTimeRemainingWithEmoji = (
	date: Date,
): { text: string; emoji: string } => {
	const now = new Date()
	const diff = date.getTime() - now.getTime()

	// For time that has passed
	if (diff < 0) {
		return {
			text: 'Ended',
			emoji: '🏁',
		}
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

	// More than 7 days
	if (days > 7) {
		return {
			text: `${days}d ${hours}h`,
			emoji: '📅',
		}
	}

	// 1-7 days
	if (days > 0) {
		return {
			text: `${days}d ${hours}h`,
			emoji: '⏳',
		}
	}

	// Less than 24 hours
	if (hours > 0) {
		return {
			text: `${hours}h ${minutes}m`,
			emoji: '⌛',
		}
	}

	// Less than 1 hour
	return {
		text: `${minutes}m`,
		emoji: '⚡',
	}
}
