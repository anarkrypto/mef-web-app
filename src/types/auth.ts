export type AuthProvider = 'discord' | 'telegram' | 'wallet'

export interface UserInfo {
	username: string
	authSource: {
		type: AuthProvider
		id: string
		username: string
	}
	metadata: {
		username: string
		authSource: {
			type: AuthProvider
			id: string
			username: string
		}
	}
	isAdmin?: boolean
}
