"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/WalletContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Check, Copy } from "lucide-react"
import type { AuroWallet } from "@/types/wallet"

interface OCVTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
}

interface TransactionToastProps {
  title: string
  description: string
  hash: string
}

function TransactionToast({ title, description, hash }: TransactionToastProps) {
  const [copied, setCopied] = useState(false)

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy hash:", err)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
        <code className="text-xs truncate flex-1">
          {hash.slice(0, 10)}...{hash.slice(-8)}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyHash}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">
            {copied ? "Copied" : "Copy transaction hash"}
          </span>
        </Button>
      </div>
    </div>
  )
}

export function OCVTransactionDialog({
  open,
  onOpenChange,
  proposalId,
}: OCVTransactionDialogProps) {
  const { state } = useWallet()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitVote = async () => {
    if (!state.wallet?.address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const memo = `YES ${proposalId}`
      let hash: string

      switch (state.wallet.provider) {
        case "auro": {
          if (!window.mina) {
            throw new Error("Auro wallet not found")
          }

          const mina = window.mina as AuroWallet

          // Request accounts first to ensure we have permission
          const accounts = await mina.requestAccounts()
          const [account] = accounts

          if (!account) {
            throw new Error("No account selected")
          }

          // Request network to ensure we're on the right network
          if (mina.requestNetwork) {
            const network = await mina.requestNetwork()
            console.log("Connected to network:", network)
          }

          // Create transaction with memo
          const tx = {
            to: account,
            amount: "0",
            memo,
            fee: "100000000", // 0.1 MINA in nanomina
          }

          // Send the transaction
          const response = await mina.sendTransaction(tx)
          hash = response.hash

          break
        }
        case "pallard":
        case "clorio":
          // Future implementation
          throw new Error(`${state.wallet.provider} wallet not yet supported`)
        default:
          throw new Error("Unsupported wallet provider")
      }

      toast({
        title: "Vote Submitted",
        description: (
          <TransactionToast
            title="Vote Submitted"
            description="Your vote has been submitted and is being processed"
            hash={hash}
          />
        ),
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Submit Vote
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              You are about to submit a vote using your connected wallet. This will create a transaction with a memo containing your vote.
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Transaction Details:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Amount: 0 MINA</li>
                <li>Recipient: Your wallet address</li>
                <li>Memo: YES {proposalId}</li>
                <li>Fee: 0.1 MINA</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitVote}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              )}
              Submit Vote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 