import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { UserMetadata } from '@/services/UserService'

type UserWithMetadata = Prisma.UserGetPayload<{
	select: {
		id: true
		linkId: true
		metadata: true
	}
}> & {
	metadata: UserMetadata | null
}

export async function getNotificationRecipients(proposal: {
	fundingRound: {
		topicId: string
	}
}): Promise<string[]> {
	// Get admin users
	const adminUsers = await prisma.adminUser.findMany({
		include: { user: true },
	})

	// Get reviewer users
	const reviewerUsers = await prisma.reviewerGroupMember.findMany({
		where: {
			reviewerGroup: {
				topics: {
					some: {
						topicId: proposal.fundingRound.topicId,
					},
				},
			},
		},
		include: { user: true },
	})

	// Combine and deduplicate users
	const allUsers = new Set([
		...adminUsers.map(admin => admin.user),
		...reviewerUsers.map(member => member.user),
	])

	// Resolve Discord IDs (including linked accounts)
	const discordIds = new Set<string>()

	for (const user of allUsers) {
		const discordId = await resolveDiscordId(user as UserWithMetadata)
		if (discordId) {
			discordIds.add(discordId)
		}
	}

	return Array.from(discordIds)
}

async function resolveDiscordId(
	user: UserWithMetadata,
): Promise<string | null> {
	// Check direct Discord auth
	if (user.metadata?.authSource?.type === 'discord') {
		return user.metadata.authSource.id
	}

	// Check linked accounts
	const linkedUsers = await prisma.user.findMany({
		where: { linkId: user.linkId },
	})

	for (const linkedUser of linkedUsers) {
		const metadata = linkedUser.metadata as UserMetadata | null
		if (metadata?.authSource?.type === 'discord') {
			return metadata.authSource.id
		}
	}

	return null
}
