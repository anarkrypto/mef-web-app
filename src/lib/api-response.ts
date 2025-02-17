import { NextResponse } from 'next/server'
import { AppError } from './errors'
import { HTTPStatus } from '@/constants/errors'
import logger from '@/logging'

export class ApiResponse {
	static notFound<T>(data: T | { error: string } | string) {
		if (typeof data === 'string') {
			data = { error: data }
		}
		return NextResponse.json(data, { status: HTTPStatus.NOT_FOUND })
	}

	static unauthorized<T>(data: T | { error: string } | string) {
		if (typeof data === 'string') {
			data = { error: data }
		}
		return NextResponse.json(data, { status: HTTPStatus.UNAUTHORIZED })
	}

	static success<T>(data: T) {
		return NextResponse.json(data)
	}

	static error(error: unknown) {
		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode },
			)
		}

		logger.error('Unhandled error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: HTTPStatus.INTERNAL_ERROR },
		)
	}

	static Response = {
		errorMessageFromResponse(
			response: { error?: string },
			defaultMessage: string,
		): string {
			return response?.error ?? defaultMessage
		},
		errorMessageFromError(
			error: unknown | Error | AppError,
			defaultMessage: string,
		): string {
			return error instanceof AppError ? error.message : defaultMessage
		},
	}
}
