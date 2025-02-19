export type WalletProvider = 'auro' | 'pallard' | 'clorio'

/*
 * Auro used to use 'testnet', now uses 'devnet'.
 * Minascan public graphql endpoint uses 'testnet'
 */
export type NetworkID = 'mainnet' | 'devnet' | 'berkeley' | 'testnet'

// Wallet event types
export type WalletEventType =
	| 'accountsChanged'
	| 'networkChanged'
	| 'chainChanged'
	| 'disconnect'
	| 'connect'

export type WalletEventPayload = {
	accountsChanged: string[]
	networkChanged: NetworkInfo
	chainChanged: NetworkInfo
	disconnect: void
	connect: void
}

export interface WalletInfo {
	address: string
	provider: WalletProvider
	publicKey: string
	network?: NetworkID | null
}

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WalletState {
	status: WalletStatus
	wallet: WalletInfo | null
	error: string | null
	lastConnected: Date | null
}

export interface WalletContextType {
	state: WalletState
	connect: (provider: WalletProvider) => Promise<void>
	disconnect: () => Promise<void>
	isConnected: boolean
	switchNetwork: (network: NetworkID) => Promise<boolean>
	enforceTargetNetwork: () => Promise<boolean>
}

// Auro wallet specific types
export interface NetworkInfo {
	networkID: NetworkID
}

export interface TransactionPayload {
	to: string
	amount: string
	memo?: string
	fee?: string
	nonce?: number
}

export interface TransactionResponse {
	hash: string
	signed: {
		data: string
		signature: string
	}
}

export interface SwitchChainArgs {
	networkID: `mina:${NetworkID}`
}

// Add these types for the signature response
interface SignedData {
	publicKey: string
	data: string
	signature: {
		field: string
		scalar: string
	}
}

interface SendPaymentArgs {
	readonly to: string
	readonly amount: number
	readonly fee?: number
	readonly memo?: string
}

type SendTransactionResult = {
	hash: string
}

export interface AuroWallet {
	requestAccounts(): Promise<string[]>
	getAccounts?(): Promise<string[]>
	requestNetwork?(): Promise<NetworkInfo>
	sendTransaction(payload: TransactionPayload): Promise<TransactionResponse>
	switchChain?(args: SwitchChainArgs): Promise<NetworkInfo>
	on?<T extends WalletEventType>(
		event: T,
		handler: (payload: WalletEventPayload[T]) => void,
	): void
	removeListener?<T extends WalletEventType>(
		event: T,
		handler: (payload: WalletEventPayload[T]) => void,
	): void
	signMessage: (args: { message: string }) => Promise<SignedData>
	sendPayment: (args: SendPaymentArgs) => Promise<SendTransactionResult>
}

declare global {
	interface Window {
		mina?: AuroWallet
	}
}
