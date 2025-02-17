'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { WalletConnectorDialog } from './WalletConnectorDialog'

export function WalletConnector() {
	const { state, disconnect } = useWallet()
	const [showDialog, setShowDialog] = useState(false)

	if (state.wallet) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">
					{state.wallet.address.slice(0, 6)}...{state.wallet.address.slice(-4)}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={disconnect}
					className="gap-2"
				>
					<Icons.logout className="h-4 w-4" />
					Disconnect
				</Button>
			</div>
		)
	}

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				className="gap-2"
				onClick={() => setShowDialog(true)}
			>
				<Icons.wallet className="h-4 w-4" />
				Connect Wallet
			</Button>

			<WalletConnectorDialog open={showDialog} onOpenChange={setShowDialog} />
		</>
	)
}
