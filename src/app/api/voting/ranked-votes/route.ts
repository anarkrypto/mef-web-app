import { NextRequest } from 'next/server'
import { OCVApiService } from '@/services/OCVApiService'
import { ApiResponse } from '@/lib/api-response'
import { AppError } from '@/lib/errors'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const roundId = searchParams.get('roundId')
		const startTime = searchParams.get('startTime')
		const endTime = searchParams.get('endTime')

		if (!roundId || !startTime || !endTime) {
			throw new AppError('Missing required parameters', 400)
		}

		const ocvService = new OCVApiService()
		const voteData = await ocvService.getRankedVotes(
			parseInt(roundId),
			parseInt(startTime),
			parseInt(endTime),
		)

		return ApiResponse.success(voteData)
	} catch (error) {
		if (error instanceof AppError) {
			return ApiResponse.error(error.message)
		}
		return ApiResponse.error('Failed to fetch ranked vote data')
	}
}
