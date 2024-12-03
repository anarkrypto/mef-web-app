"use client"

import { useState } from "react"
import { Copy, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ManualVoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voteId: string
  voteType: "YES" | "NO"
}

export function ManualVoteDialog({ 
  open, 
  onOpenChange, 
  voteId, 
  voteType 
}: ManualVoteDialogProps) {
  const [copied, setCopied] = useState(false)
  const memo = `${voteType} ${voteId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(memo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How to Cast Your Vote
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              To cast your vote, you need to send a transaction with the following memo:
            </p>
            
            <div className="relative">
              <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
                <code className="text-lg font-mono">{memo}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className={cn(
                    "transition-colors",
                    copied && "text-green-500"
                  )}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy memo</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Instructions:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Copy the memo shown above</li>
                <li>Use your preferred CLI tool to create a transaction</li>
                <li>Set the recipient address to your own address</li>
                <li>Set the transaction amount (can be 0 MINA)</li>
                <li>Set the memo field to the copied text</li>
                <li>Send the transaction to register your vote</li>
              </ol>
              <p className="mt-4 text-sm">
                Note: Make sure to follow the exact format of the memo to ensure your vote is properly recorded. The transaction must be sent to your own address, and the amount can be 0 MINA.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

