import { HTTPStatus } from '@/constants/errors'

export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = HTTPStatus.INTERNAL_ERROR,
		public code?: string,
	) {
		super(message)
		this.name = 'AppError'
	}

	static notFound(message: string) {
		return new AppError(message, HTTPStatus.NOT_FOUND)
	}

	static unauthorized(message: string) {
		return new AppError(message, HTTPStatus.UNAUTHORIZED)
	}

	static forbidden(message: string) {
		return new AppError(message, HTTPStatus.FORBIDDEN)
	}

	static badRequest(message: string) {
		return new AppError(message, HTTPStatus.BAD_REQUEST)
	}
}
