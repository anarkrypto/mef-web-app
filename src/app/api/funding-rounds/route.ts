import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import logger from '@/logging'
import {
	FundingRoundService,
	fundingRoundSortSchema,
	SortOption,
} from '@/services'

export async function GET(req: NextRequest) {
	try {
		const sortBy = req.nextUrl.searchParams.get(
			'sortBy',
		) as SortOption['sortBy']
		const sortOrder = req.nextUrl.searchParams.get(
			'sortOrder',
		) as SortOption['sortOrder']

		if (sortBy || sortOrder) {
			const { error } = fundingRoundSortSchema.safeParse({
				sortBy,
				sortOrder: sortOrder || 'desc',
			})
			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 })
			}
		}

		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const fundingRoundService = new FundingRoundService(prisma)

		const rounds = await fundingRoundService.getPublicFundingRounds({
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
