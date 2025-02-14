import {
	FundingRoundPhase,
	FundingRoundPhases,
	FundingRoundStatus,
	FundingRoundWithPhases,
} from '@/types/funding-round'
import {
	PrismaClient,
	FundingRound as PrismaFundingRound,
} from '@prisma/client'

export class FundingRoundService {
	private prisma: PrismaClient

	constructor(prisma: PrismaClient) {
		this.prisma = prisma
	}

	async getPublicFundingRounds(): Promise<FundingRoundWithPhases[]> {
		const rounds = await this.prisma.fundingRound.findMany({
			where: {
				status: {
					in: ['ACTIVE', 'COMPLETED'],
				},
			},
			include: {
				_count: {
					select: { proposals: true },
				},
				submissionPhase: true,
				considerationPhase: true,
				deliberationPhase: true,
				votingPhase: true,
				topic: true,
			},
			orderBy: [
				{ status: 'desc' }, // ACTIVE rounds first
				{ startDate: 'desc' }, // then by start date
			],
		})

		return rounds.map(({ _count, ...round }) => {
			const phases: FundingRoundPhases = {
				submission: {
					id: round.submissionPhase!.id,
					startDate: round.submissionPhase!.startDate.toISOString(),
					endDate: round.submissionPhase!.endDate.toISOString(),
				},
				consideration: {
					id: round.considerationPhase!.id,
					startDate: round.considerationPhase!.startDate.toISOString(),
					endDate: round.considerationPhase!.endDate.toISOString(),
				},
				deliberation: {
					id: round.deliberationPhase!.id,
					startDate: round.deliberationPhase!.startDate.toISOString(),
					endDate: round.deliberationPhase!.endDate.toISOString(),
				},
				voting: {
					id: round.votingPhase!.id,
					startDate: round.votingPhase!.startDate.toISOString(),
					endDate: round.votingPhase!.endDate.toISOString(),
				},
			}

			const startDate = round.startDate.toDateString()
			const endDate = round.endDate.toDateString()

			return {
				...round,
				totalBudget: round.totalBudget.toString(),
				proposalsCount: _count.proposals,
				status: round.status as FundingRoundStatus,
				startDate,
				endDate,
				phase: this.getCurrentPhase(startDate, endDate, phases),
				phases,
			}
		})
	}

	async getActiveFundingRounds() {
		const now = new Date()
		return await this.prisma.fundingRound.findMany({
			where: {
				startDate: { lte: now },
				endDate: { gte: now },
				status: 'ACTIVE',
			},
			include: {
				proposals: true,
				submissionPhase: true,
				considerationPhase: true,
				deliberationPhase: true,
				votingPhase: true,
			},
			orderBy: { startDate: 'asc' },
		})
	}

	async getFundingRoundById(id: string) {
		return await this.prisma.fundingRound.findUnique({
			where: { id },
			include: {
				proposals: true,
				submissionPhase: true,
				considerationPhase: true,
				deliberationPhase: true,
				votingPhase: true,
			},
		})
	}

	getCurrentPhase(
		startDate: string,
		endDate: string,
		phases: FundingRoundPhases,
	): FundingRoundPhase {
		// TODO: Check if we can improve this one by relying on the database directly

		const now = new Date()

		if (now < new Date(startDate) || now >= new Date(phases.submission.startDate)) {
			return 'UPCOMING'
		}

		if (
			now >= new Date(phases.submission.startDate) &&
			now <= new Date(phases.submission.endDate)
		) {
			return 'SUBMISSION'
		}

		if (
			now >= new Date(phases.consideration.startDate) &&
			now <= new Date(phases.consideration.endDate)
		) {
			return 'CONSIDERATION'
		}

		if (
			now >= new Date(phases.deliberation.startDate) &&
			now <= new Date(phases.deliberation.endDate)
		) {
			return 'DELIBERATION'
		}

		if (
			now >= new Date(phases.voting.startDate) &&
			now <= new Date(phases.voting.endDate)
		) {
			return 'VOTING'
		}

		if (now > new Date(endDate)) {
			return 'COMPLETED'
		}

		throw new Error('Invalid current phase')
	}

	getTimeRemaining(date: Date): string {
		const now = new Date()
		const diff = date.getTime() - now.getTime()

		// Convert to positive number for calculations
		const absDiff = Math.abs(diff)

		const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
		const hours = Math.floor(
			(absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
		)
		const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))

		// If more than one day remaining
		if (days > 0) {
			return `${days}d ${hours}h`
		}

		// If less than one day remaining
		if (hours > 0) {
			return `${hours}h ${minutes}m`
		}

		// If less than one hour remaining
		return `${minutes}m`
	}

	getTimeRemainingWithEmoji(date: Date): { text: string; emoji: string } {
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
}
