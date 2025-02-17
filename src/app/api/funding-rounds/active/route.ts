import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { FundingRoundService } from '@/services/FundingRoundService'

export async function GET(req: NextRequest) {
	try {
		const fundingRoundService = new FundingRoundService(prisma)
		const activeFundingRounds =
			await fundingRoundService.getActiveFundingRounds()

		return ApiResponse.success(activeFundingRounds)
	} catch (error) {
		return ApiResponse.error(error)
	}
}
