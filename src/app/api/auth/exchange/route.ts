import { verifyToken, generateTokenPair, setTokenCookies } from '@/lib/auth/jwt'
import { AppError } from '@/lib/errors'
import { ApiResponse } from '@/lib/api-response'
import logger from '@/logging'
import { HTTPStatus } from '@/constants/errors'
import * as jose from 'jose'

export const runtime = 'nodejs'

export async function POST(request: Request) {
	try {
		const { initialToken } = await request.json()

		if (!initialToken) {
			throw new AppError('Initial token is required', HTTPStatus.BAD_REQUEST)
		}

		try {
			// Verify the initial token
			const payload = await verifyToken(initialToken)

			// Generate new token pair
			const { accessToken, refreshToken } = await generateTokenPair(
				payload.authSource,
			)

			// Create response and set cookies
			const response = ApiResponse.success({ success: true })
			return setTokenCookies(response, accessToken, refreshToken)
		} catch (error) {
			// Handle specific JWT errors
			if (error instanceof jose.errors.JWTExpired) {
				throw new AppError(
					'Authentication token has expired',
					HTTPStatus.UNAUTHORIZED,
				)
			}
			if (error instanceof jose.errors.JWTInvalid) {
				throw new AppError(
					'Invalid authentication token',
					HTTPStatus.UNAUTHORIZED,
				)
			}
			if (error instanceof jose.errors.JWTClaimValidationFailed) {
				throw new AppError('Token validation failed', HTTPStatus.UNAUTHORIZED)
			}
			if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
				throw new AppError('Invalid token signature', HTTPStatus.UNAUTHORIZED)
			}

			// For any other JWT-related errors
			if (error instanceof jose.errors.JOSEError) {
				throw new AppError(
					'Authentication token error',
					HTTPStatus.UNAUTHORIZED,
				)
			}

			// Re-throw unknown errors
			throw error
		}
	} catch (error) {
		logger.error('Token exchange error:', error)
		// If it's already an AppError, pass it through
		if (error instanceof AppError) {
			return ApiResponse.error(error)
		}

		// For unexpected errors
		return ApiResponse.error(
			new AppError('Authentication failed', HTTPStatus.INTERNAL_ERROR),
		)
	}
}
