import { NextResponse } from 'next/server'
import { AdminService } from '@/services/AdminService'
import prisma from '@/lib/prisma'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import logger from '@/logging'

const adminService = new AdminService(prisma)

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

		const group = await adminService.getReviewerGroupById(
			(await context.params).id,
		)
		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 })
		}

		return NextResponse.json(group)
	} catch (error) {
		logger.error('Failed to fetch reviewer group:', error)
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

		const { name, description, memberIds } = await request.json()
		const group = await adminService.updateReviewerGroupWithMembers(
			(await context.params).id,
			{
				name,
				description,
			},
			memberIds,
		)

		return NextResponse.json(group)
	} catch (error) {
		logger.error('Failed to update reviewer group:', error)
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

		await adminService.deleteReviewerGroup((await context.params).id)
		return new NextResponse(null, { status: 204 })
	} catch (error) {
		logger.error('Failed to delete reviewer group:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
