import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api-response'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AdminFeedbackService } from '@/services/AdminFeedbackService'
import { AppError } from '@/lib/errors'
import { AuthErrors, HTTPStatus } from '@/constants/errors'
import { AdminService } from '@/services'

const adminService = new AdminService(prisma)

export async function GET(req: NextRequest) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			throw new AppError('Unauthorized', HTTPStatus.UNAUTHORIZED)
		}

		// Check if user is admin
		const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId)
		if (!isAdmin) {
			throw AppError.forbidden(AuthErrors.FORBIDDEN)
		}

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')
		const orderBy = (searchParams.get('orderBy') || 'desc') as 'asc' | 'desc'

		const feedbackService = new AdminFeedbackService(prisma)
		const result = await feedbackService.getFeedbackList({
			page,
			limit,
			orderBy,
		})

		return ApiResponse.success(result)
	} catch (error) {
		return ApiResponse.error(error)
	}
}
