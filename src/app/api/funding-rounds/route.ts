import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import logger from '@/logging'
import { FundingRoundService } from '@/services'

export async function GET(req: Request) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const fundingRoundService = new FundingRoundService(prisma)

		const rounds = await fundingRoundService.getPublicFundingRounds()

		return NextResponse.json(rounds)
	} catch (error) {
		logger.error('Failed to fetch funding rounds:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
