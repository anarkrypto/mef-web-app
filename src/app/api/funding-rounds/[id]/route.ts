import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api-response'
import { AppError } from '@/lib/errors'
import prisma from '@/lib/prisma'
import { FundingRoundService } from '@/services'

interface RouteContext {
	params: Promise<{
		id: string
	}>
}

export async function GET(request: NextRequest, context: RouteContext) {
	const id = (await context.params).id
	const fundingRoundService = new FundingRoundService(prisma)
	try {
		const fundingRound = await fundingRoundService.getFundingRoundById(id)

		if (!fundingRound) {
			throw AppError.notFound('Funding round not found')
		}

		return ApiResponse.success(fundingRound)
	} catch (error) {
		if (error instanceof AppError) {
			return ApiResponse.error(error)
		}
		return ApiResponse.error(
			AppError.badRequest('Failed to fetch funding round details'),
		)
	}
}
