export type FundingRoundStatusAdmin =
	| 'UPCOMING'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'DRAFT'
	| 'CANCELLED'

export type FundingRoundStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED'

export type FundingRoundPhase =
	| 'UPCOMING'
	| 'SUBMISSION'
	| 'CONSIDERATION'
	| 'DELIBERATION'
	| 'VOTING'
	| 'COMPLETED'

export interface FundingRound {
	id: string
	name: string
	description: string
	status: FundingRoundStatus
	phase: FundingRoundPhase
	startDate: string
	endDate: string
	totalBudget: string
	proposalsCount: number
	mefId: number
}

export interface FundingRoundPhaseData {
	id: string
	startDate: string
	endDate: string
}

export interface FundingRoundPhases {
	submission: FundingRoundPhaseData
	consideration: FundingRoundPhaseData
	deliberation: FundingRoundPhaseData
	voting: FundingRoundPhaseData
}

export interface FundingRoundWithPhases extends FundingRound {
	phases: FundingRoundPhases
}
