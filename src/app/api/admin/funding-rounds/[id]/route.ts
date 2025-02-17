import { NextResponse } from 'next/server'
import { AdminService } from '@/services/AdminService'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import { validatePhaseDates } from '@/lib/validation'
import logger from '@/logging'

const adminService = new AdminService(prisma)

interface DateRange {
	from: string
	to: string
}

interface FundingRoundRequestData {
	name: string
	description: string
	topicId: string
	totalBudget: number
	fundingRoundDates: DateRange
	submissionDates: DateRange
	considerationDates: DateRange
	deliberationDates: DateRange
	votingDates: DateRange
}

interface RouteContext {
	params: Promise<{
		id: string
	}>
}

export async function GET(request: Request, context: RouteContext) {
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId)
		if (!isAdmin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const round = await adminService.getFundingRoundById(
			(await context.params).id,
		)
		if (!round) {
			return NextResponse.json(
				{ error: 'Funding round not found' },
				{ status: 404 },
			)
		}

		return NextResponse.json(round)
	} catch (error) {
		logger.error('Failed to fetch funding round:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

export async function PUT(request: Request, context: RouteContext) {
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId)
		if (!isAdmin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const data: FundingRoundRequestData = await request.json()

		// Convert string dates to Date objects for validation
		const fundingRoundDates = {
			from: new Date(data.fundingRoundDates.from),
			to: new Date(data.fundingRoundDates.to),
		}
		const submissionDates = {
			from: new Date(data.submissionDates.from),
			to: new Date(data.submissionDates.to),
		}
		const considerationDates = {
			from: new Date(data.considerationDates.from),
			to: new Date(data.considerationDates.to),
		}
		const deliberationDates = {
			from: new Date(data.deliberationDates.from),
			to: new Date(data.deliberationDates.to),
		}
		const votingDates = {
			from: new Date(data.votingDates.from),
			to: new Date(data.votingDates.to),
		}

		// Validate phase dates
		const datesValid = validatePhaseDates({
			fundingRound: fundingRoundDates,
			submission: submissionDates,
			consideration: considerationDates,
			deliberation: deliberationDates,
			voting: votingDates,
		})

		if (!datesValid.valid) {
			return NextResponse.json({ error: datesValid.error }, { status: 400 })
		}

		const round = await adminService.updateFundingRound(
			(await context.params).id,
			{
				name: data.name,
				description: data.description,
				topicId: data.topicId,
				totalBudget: data.totalBudget,
				fundingRoundDates,
				submissionDates,
				considerationDates,
				deliberationDates,
				votingDates,
			},
		)

		return NextResponse.json(round)
	} catch (error) {
		logger.error('Failed to update funding round:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: Request, context: RouteContext) {
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId)
		if (!isAdmin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await adminService.deleteFundingRound((await context.params).id)
		return new NextResponse(null, { status: 204 })
	} catch (error) {
		logger.error('Failed to delete funding round:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
