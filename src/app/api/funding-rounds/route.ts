import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import logger from '@/logging'
import {
	FundingRoundService,
	getPublicFundingRoundsOptionsSchema,
} from '@/services'

export async function GET(req: NextRequest) {
	try {
		const { data: { filterName, sortBy, sortOrder } = {}, error } =
			getPublicFundingRoundsOptionsSchema.safeParse({
				filterName: req.nextUrl.searchParams.get('filterName'),
				sortBy: req.nextUrl.searchParams.get('sortBy'),
				sortOrder: req.nextUrl.searchParams.get('sortOrder'),
			})
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const fundingRoundService = new FundingRoundService(prisma)

		const rounds = await fundingRoundService.getPublicFundingRounds({
			filterName,
			sortBy,
			sortOrder,
		})

		return NextResponse.json(rounds)
	} catch (error) {
		logger.error('Failed to fetch funding rounds:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
