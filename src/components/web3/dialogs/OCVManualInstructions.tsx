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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"

interface ManualVoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voteId: string
  voteType: "YES" | "NO"
  existingVote?: {
    address: string
    timestamp: number
    hash: string
  } | null
}

export function ManualVoteDialog({ 
  open, 
  onOpenChange, 
  voteId, 
  voteType,
  existingVote
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
            How do I cast my vote?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {existingVote && (
            <Alert 
              className={cn(
                "border-orange-200 dark:border-orange-900",
                "bg-orange-100 dark:bg-orange-900/30",
                "text-orange-900 dark:text-orange-200",
                "[&>svg]:text-orange-900 dark:[&>svg]:text-orange-200"
              )}
            >
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Your connected wallet has already voted on this proposal
                  </p>
                  <div className="text-xs space-y-1 text-orange-800 dark:text-orange-200/90">
                    <p>Time: {formatDistanceToNow(existingVote.timestamp)} ago</p>
                    <p className="break-all">
                      Transaction: {existingVote.hash}
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Send a transaction to yourself with the following text in the memo field:
            </p>
            
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <code className="flex-1 text-sm font-mono break-all">{memo}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className={cn(
                    "flex-shrink-0 transition-colors",
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

            <div className="space-y-3">
              <p className="font-medium text-sm">Instructions:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Copy the memo shown above</li>
                <li>Use your preferred wallet (or a CLI) to create a transaction</li>
                <li>Set the recipient address to your own address</li>
                <li>Set the transaction amount (can be 0 MINA)</li>
                <li>Set the memo field to the copied text</li>
                <li>Send the transaction to cast your vote</li>
              </ol>
            </div>
              
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Note: Make sure to follow the exact format of the memo to ensure your vote is properly recorded. 
                The transaction must be sent to your own address, and the amount can be 0 MINA.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

