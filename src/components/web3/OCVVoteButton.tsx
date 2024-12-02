"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"
import { WalletConnectorDialog } from "./WalletConnectorDialog"
import { ManualVoteDialog } from "./dialogs/OCVManualInstructions"
import { OCVTransactionDialog } from "./dialogs/OCVTransactionDialog"
import { Icons } from "@/components/icons"
import { TARGET_NETWORK } from "@/contexts/WalletContext"

interface OCVVoteButtonProps {
  proposalId: string
  useWallet?: boolean
}

export function OCVVoteButton({ proposalId, useWallet: isWalletEnabled = true }: OCVVoteButtonProps) {
  const { state, enforceTargetNetwork } = useWallet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)

  const handleVoteClick = async () => {
    if (!isWalletEnabled) {
      setShowManualDialog(true)
      return
    }

    if (!state.wallet) {
      setShowWalletDialog(true)
      return
    }

    if (state.wallet.network !== TARGET_NETWORK) {
      const networkSwitched = await enforceTargetNetwork()
      if (!networkSwitched) {
        return
      }
    }

    setShowTransactionDialog(true)
  }

  const buttonText = isWalletEnabled 
    ? state.wallet 
      ? "Vote with Wallet"
      : "Connect Wallet to Vote"
    : "Vote Without Wallet"

  return (
    <>
      <Button
        variant={isWalletEnabled ? "default" : "outline"}
        onClick={handleVoteClick}
        className="gap-2"
      >
        {isWalletEnabled && <Icons.wallet className="h-4 w-4" />}
        {buttonText}
      </Button>

      <WalletConnectorDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog}
      />

      <ManualVoteDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        voteId={proposalId}
        voteType="YES"
      />

      {state.wallet && (
        <OCVTransactionDialog
          open={showTransactionDialog}
          onOpenChange={setShowTransactionDialog}
          proposalId={proposalId}
        />
      )}
    </>
  )
} 