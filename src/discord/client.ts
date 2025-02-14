import logger from '@/logging'
import { Client, GatewayIntentBits } from 'discord.js'

let client: Client | null = null

export async function getDiscordClient(): Promise<Client> {
	if (client) return client

	const newClient = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.DirectMessages,
		],
	})

	newClient.once('ready', () => {
		logger.debug(`Logged in as ${newClient.user?.tag}`)
	})

	newClient.on('error', error => {
		logger.error('Discord client error:', error)
	})

	try {
		await newClient.login(process.env.DISCORD_BOT_TOKEN)
		client = newClient
	} catch (error) {
		logger.error('Failed to login to Discord:', error)
		throw error
	}

	return newClient
}
