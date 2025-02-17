import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api-response'
import { getOrCreateUserFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { FeedbackService } from '@/services/FeedbackService'
import { AppError } from '@/lib/errors'
import { HTTPStatus } from '@/constants/errors'

export async function POST(req: NextRequest) {
	try {
		const user = await getOrCreateUserFromRequest(req)
		if (!user) {
			throw new AppError('Unauthorized', HTTPStatus.UNAUTHORIZED)
		}

		const formData = await req.formData()
		const feedback = formData.get('feedback') as string
		const imageData = formData.get('image') as File | null
		const metadataStr = formData.get('metadata') as string

		if (!feedback) {
			throw new AppError('Feedback message is required', HTTPStatus.BAD_REQUEST)
		}

		let imageBuffer: Buffer | undefined
		if (imageData) {
			const arrayBuffer = await imageData.arrayBuffer()
			imageBuffer = Buffer.from(arrayBuffer)
		}

		const metadata = metadataStr
			? JSON.parse(metadataStr)
			: {
					url: req.nextUrl.pathname,
					userAgent: req.headers.get('user-agent') || 'unknown',
					timestamp: new Date().toISOString(),
				}

		const feedbackService = new FeedbackService(prisma)
		const result = await feedbackService.submitFeedback({
			userId: user.id,
			feedback,
			image: imageBuffer,
			metadata,
		})

		return ApiResponse.success({ success: true, feedback: result })
	} catch (error) {
		return ApiResponse.error(error)
	}
}
