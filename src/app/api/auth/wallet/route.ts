import { cookies } from 'next/headers'
import { verifyToken, generateTokenPair, setTokenCookies } from '@/lib/auth/jwt'
import logger from '@/logging'
import {
	WALLET_MESSAGE_VERSIONS,
	LATEST_WALLET_MESSAGE_VERSION,
	WalletMessageVersion,
} from '@/constants/wallet-messages'
import Client from 'mina-signer'
import { AppError } from '@/lib/errors'
import { ApiResponse } from '@/lib/api-response'
import { UserService } from '@/services/UserService'
import prisma from '@/lib/prisma'
import { deriveUserId } from '@/lib/user/derive'

const userService = new UserService(prisma)

export const runtime = 'nodejs'

interface WalletAuthRequest {
	message: string
	signature: {
		field: string
		scalar: string
	}
	publicKey: string
	timestamp: string
	version: WalletMessageVersion
}

export async function POST(request: Request) {
	try {
		const body: WalletAuthRequest = await request.json()
		const { message, signature, publicKey, timestamp, version } = body

		// 1. Verify message format and timestamp
		const expectedMessage = WALLET_MESSAGE_VERSIONS[version].generateMessage(
			publicKey,
			timestamp,
		)

		if (message !== expectedMessage) {
			throw new AppError('Invalid message format', 400)
		}

		// 2. Check timestamp (within 30 minutes)
		const messageTime = new Date(timestamp)
		const now = new Date()
		const timeDiff = Math.abs(now.getTime() - messageTime.getTime()) / 1000 / 60

		if (timeDiff > 30) {
			throw new AppError('Message expired', 401)
		}

		// 3. Verify signature using Mina signer
		const client = new Client({ network: 'testnet' })
		const isValid = client.verifyMessage({
			data: message,
			publicKey,
			signature,
		})

		if (!isValid) {
			throw new AppError('Invalid signature', 401)
		}

		// 4. Generate wallet auth source and derive user ID
		const walletAuthSource = {
			type: 'wallet' as const,
			id: publicKey,
			username: publicKey,
		}
		const walletUserId = deriveUserId(walletAuthSource)

		// 5. Check for existing session and linking possibility
		const cookieStore = await cookies()
		const existingAccessToken = cookieStore.get('access_token')?.value
		let canLink = false

		if (existingAccessToken) {
			try {
				const existingPayload = await verifyToken(existingAccessToken)
				const existingUserId = deriveUserId(existingPayload.authSource)

				// Check if linking is possible using UserService
				canLink = await userService.canLink(walletUserId, existingUserId)
			} catch (error) {
				logger.debug('Existing token invalid or linking not possible:', error)
				canLink = false
			}
		}

		// 6. Generate auth tokens
		const { accessToken, refreshToken } =
			await generateTokenPair(walletAuthSource)

		// 7. Create response with linking info
		const response = ApiResponse.success({
			success: true,
			canLink,
			...(canLink && {
				accessToken,
				existingToken: existingAccessToken,
			}),
		})

		// Set cookies and return response
		return setTokenCookies(response, accessToken, refreshToken)
	} catch (error) {
		logger.error('Wallet authentication error:', error)
		return ApiResponse.error(error)
	} finally {
		await prisma.$disconnect()
	}
}
