import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import logger from '@/logging'

export async function GET(req: Request) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Get all users
		const users = await prisma.user.findMany({
			select: {
				id: true,
				metadata: true,
			},
		})

		return NextResponse.json(users)
	} catch (error) {
		logger.error('Failed to fetch users:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
