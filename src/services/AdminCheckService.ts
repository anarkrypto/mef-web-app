import { PrismaClient } from '@prisma/client'
import { cache } from 'react'

// Create a cached singleton instance
const prisma = new PrismaClient()

export const AdminCheckService = {
	checkAdminStatus: cache(
		async (userId: string, linkId: string): Promise<boolean> => {
			try {
				const adminUser = await prisma.adminUser.findFirst({
					where: {
						OR: [
							{ userId },
							{
								user: {
									linkId,
								},
							},
						],
					},
				})
				return !!adminUser
			} catch (error) {
				console.error('Admin check failed:', error)
				return false
			}
		},
	),
}
