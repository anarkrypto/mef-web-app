import { NextRequest } from 'next/server'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import { ProposalService } from '@/services/ProposalService'
import { GptSurveyService } from '@/services/GptSurveyService'
import { ApiResponse } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import logger from '@/logging'

const proposalService = new ProposalService(prisma)
const gptSurveyService = new GptSurveyService(prisma)

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const awaitedParams = await params
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return ApiResponse.unauthorized('Please log in to view comments')
		}

		// Get comments and GPT survey summary
		const [comments, gptSurveySummary] = await Promise.all([
			proposalService.getProposalComments(parseInt(awaitedParams.id)),
			gptSurveyService.getProposalSummary(parseInt(awaitedParams.id)),
		])

		// Merge the GPT survey summary with comments if available
		const response = {
			...comments,
			gptSurveySummary: gptSurveySummary
				? {
						summary: gptSurveySummary.summary,
						summaryUpdatedAt: gptSurveySummary.summary_updated_at,
					}
				: undefined,
		}

		return ApiResponse.success(response)
	} catch (error) {
		logger.error('Error fetching proposal comments:', error)
		return ApiResponse.error(error)
	}
}
