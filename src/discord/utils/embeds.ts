import { EmbedBuilder } from 'discord.js'
import { Prisma } from '@prisma/client'
import { UserMetadata } from '@/services/UserService'

interface ProposalWithRelations {
	id: number
	title: string
	user: {
		id: string
		metadata: Prisma.JsonValue
	}
	fundingRound: {
		id: string
		name: string
	} | null
}

function truncate(str: string | null | undefined, maxLength: number): string {
	if (!str) return ''
	if (str.length <= maxLength) return str
	return str.slice(0, maxLength - 3) + '...'
}

export function createProposalEmbed(
	proposal: ProposalWithRelations,
): EmbedBuilder {
	const metadata = proposal.user.metadata as UserMetadata | null
	const username = metadata?.username || 'Unknown'

	return new EmbedBuilder()
		.setTitle(`🆕 New Proposal Submitted`)
		.setDescription(
			truncate(
				`A new proposal has been submitted to ${proposal.fundingRound?.name || 'Unknown'}`,
				4000,
			),
		)
		.addFields([
			{
				name: 'Title',
				value: truncate(proposal.title || 'Untitled', 1024),
			},
			{
				name: 'Submitted by',
				value: truncate(username, 1024),
			},
			{
				name: 'Funding Round',
				value: truncate(proposal.fundingRound?.name || 'Unknown', 1024),
			},
			{
				name: 'View proposal',
				value: `${process.env.NEXT_APP_URL}/proposals/${proposal.id}`,
			},
		])
		.setTimestamp()
		.setColor(0x00ff00)
}
