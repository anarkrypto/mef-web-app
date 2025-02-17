import { NextRequest } from 'next/server'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import { DeliberationService } from '@/services/DeliberationService'
import { GptSurveyService } from '@/services/GptSurveyService'
import { ApiResponse } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import logger from '@/logging'
import type { DeliberationProposal } from '@/types/deliberation'

const deliberationService = new DeliberationService(prisma)
const gptSurveyService = new GptSurveyService(prisma)

type ServiceResponse = {
	proposals: Array<DeliberationProposal>
	pendingCount: number
	totalCount: number
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return ApiResponse.unauthorized('Please log in to view proposals')
		}

		// Get proposals first
		const { proposals } = (await deliberationService.getDeliberationProposals(
			(await params).id,
			user.id,
		)) as ServiceResponse

		// Get GPT summaries for each proposal
		const proposalsWithSummaries = await Promise.all(
			proposals.map(async (proposal: DeliberationProposal) => {
				const gptSummary = await gptSurveyService.getProposalSummary(
					proposal.id,
				)
				return {
					...proposal,
					gptSurveySummary:
						gptSummary && gptSummary.summary && gptSummary.summary_updated_at
							? {
									proposalId: proposal.id,
									summary: gptSummary.summary,
									summaryUpdatedAt: gptSummary.summary_updated_at,
								}
							: undefined,
				}
			}),
		)

		const pendingCount = proposalsWithSummaries.reduce(
			(count: number, p: DeliberationProposal) =>
				!p.userDeliberation ? count + 1 : count,
			0,
		)

		return ApiResponse.success({
			proposals: proposalsWithSummaries,
			pendingCount,
			totalCount: proposalsWithSummaries.length,
		})
	} catch (error) {
		logger.error('Error fetching deliberation proposals:', error)
		return ApiResponse.error(error)
	}
}
