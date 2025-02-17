import { NextResponse } from 'next/server'
import { ProposalService } from '@/services/ProposalService'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import { ZodError } from 'zod'
import logger from '@/logging'

const proposalService = new ProposalService(prisma)

export async function GET(req: Request) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json(
				{ error: 'Please log in to view proposals' },
				{ status: 401 },
			)
		}

		// Get proposals for user and linked accounts
		const proposals = await proposalService.getUserProposalsWithLinked(
			user.id,
			user.linkId,
		)

		return NextResponse.json(proposals)
	} catch (error) {
		logger.error('Failed to fetch proposals:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

export async function POST(req: Request) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json(
				{ error: 'Please log in to create proposals' },
				{ status: 401 },
			)
		}

		const data = await req.json()
		const proposal = await proposalService.createDraft(user.id, data)

		return NextResponse.json(proposal)
	} catch (error) {
		logger.error('Failed to create proposal:', error)

		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: error.errors,
				},
				{ status: 400 },
			)
		}

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
