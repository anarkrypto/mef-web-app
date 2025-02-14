import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import Bree from 'bree'
import path from 'path'
import logger from '@/logging'

interface RouteContext {
	params: Promise<{
		id: string
	}>
}

// Initialize Bree for job scheduling
const bree = new Bree({
	root: path.join(process.cwd(), 'dist', 'tasks'),
	jobs: [
		{
			name: 'discord-notify-proposal-submission',
			path: path.join(
				process.cwd(),
				'dist',
				'tasks',
				'discord-notify-proposal-submission.js',
			),
			worker: {
				workerData: {
					proposalId: null, // set when job is run
				},
			},
		},
	],
})

// Set up event listeners for the job
bree.on('worker created', name => {
	logger.debug(`Worker ${name} created`)
})

bree.on('worker deleted', name => {
	logger.debug(`Worker ${name} deleted`)
})

export async function POST(request: Request, context: RouteContext) {
	try {
		const user = await getOrCreateUserFromRequest(request)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const proposalId = parseInt((await context.params).id)
		const { fundingRoundId } = await request.json()

		// Verify the proposal belongs to the user
		const proposal = await prisma.proposal.findUnique({
			where: { id: proposalId },
		})

		if (!proposal) {
			return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
		}

		if (proposal.userId !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		// Verify the funding round exists and is in submission phase
		const fundingRound = await prisma.fundingRound.findUnique({
			where: { id: fundingRoundId },
			include: {
				submissionPhase: true,
			},
		})

		if (!fundingRound) {
			return NextResponse.json(
				{ error: 'Funding round not found' },
				{ status: 404 },
			)
		}

		const now = new Date()
		const submissionStart = new Date(fundingRound.submissionPhase!.startDate)
		const submissionEnd = new Date(fundingRound.submissionPhase!.endDate)

		if (now < submissionStart || now > submissionEnd) {
			return NextResponse.json(
				{ error: 'Funding round is not in submission phase' },
				{ status: 400 },
			)
		}

		// Update the proposal
		const updatedProposal = await prisma.proposal.update({
			where: { id: proposalId },
			data: {
				fundingRoundId,
				status: 'CONSIDERATION',
			},
			include: {
				fundingRound: {
					include: {
						submissionPhase: true,
						considerationPhase: true,
						deliberationPhase: true,
						votingPhase: true,
					},
				},
			},
		})

		// Update worker data before running the job
		const job = bree.config.jobs.find(
			j => j.name === 'discord-notify-proposal-submission',
		)
		if (job && job.worker) {
			job.worker.workerData = {
				proposalId: proposalId.toString(),
			}
		}

		// Run the job (instead of starting it)
		await bree.run('discord-notify-proposal-submission')

		return NextResponse.json(updatedProposal)
	} catch (error) {
		logger.error('Failed to submit proposal:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
