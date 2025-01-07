"use client"

import {
  GripVertical,
  Wallet,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Users,
  Coins,
  Info,
} from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ProposalWithUniqueId} from "./types"

/* -------------------------------------------------------------
 * Types & Interfaces
 * ------------------------------------------------------------- */
/* -------------------------------------------------------------
 * The proposal UI content (with tooltips, icons, etc.)
 * Also includes the "grip" handle where we start the reorder drag
 * ------------------------------------------------------------- */
export const ProposalContent: React.FC<{
    proposal: ProposalWithUniqueId
    index?: number
    isRanked?: boolean
}> = ({ proposal, index, isRanked }) => {
    const formatWalletAddress = (address: string) => {
      if (address.length <= 12) return address
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
  
    // If isRanked, dragging the "grip" will reorder items
    const handlePointerDownForReorder = (
      e: React.PointerEvent<HTMLDivElement>
    ) => {
      if (isRanked) {
        // Stop the HTML drag from starting so that Framer can do vertical reorder
        e.stopPropagation()
        e.preventDefault()
      }
    }
  
    return (
      <>
        <div className="flex items-center gap-2">
          {/* Reorder Grip: only starts Framer reorder if isRanked */}
          <div
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDownForReorder}
          >
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
  
          {isRanked && (
            <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-purple-600 bg-purple-100 rounded-full flex-shrink-0">
              {(index ?? 0) + 1}
            </div>
          )}
          <div className="flex-1 truncate">
            <span>{proposal.proposalName}</span>
          </div>
          {isRanked ? (
            <ArrowLeft className="w-4 h-4 text-purple-500 opacity-50 group-hover:opacity-100" />
          ) : (
            <ArrowRight className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
          )}
        </div>
  
        <div className="flex items-center gap-4 text-sm text-muted-foreground px-2">
          <TooltipProvider>
            {/* Proposal ID & Info */}
            <HoverCard>
              <HoverCardTrigger className="flex items-center gap-1 hover:text-primary transition-colors">
                <Info className="w-3 h-3" />
                <span className="text-xs font-mono">#{proposal.id}</span>
              </HoverCardTrigger>
              <HoverCardContent 
                align="start"
                className="w-80 p-4"
              >
                <div className="space-y-4">
                  {/* Header with ID and Link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        Proposal ID: {proposal.id}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs hover:bg-transparent"
                      asChild
                    >
                      <a
                        href={`/proposals/${proposal.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Full Details →
                      </a>
                    </Button>
                  </div>

                  {/* Scrollable Abstract */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Abstract</h4>
                    <div 
                      className="text-xs text-muted-foreground max-h-24 overflow-y-auto pr-2
                                scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300
                                scrollbar-track-transparent"
                    >
                      {proposal.abstract}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Author */}
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                {proposal.author.authType === "wallet" ? (
                  <Wallet className="w-3 h-3" />
                ) : (
                  <MessageCircle className="w-3 h-3" />
                )}
                <span>
                  {proposal.author.authType === "wallet"
                    ? formatWalletAddress(proposal.author.username)
                    : proposal.author.username}
                </span>
              </TooltipTrigger>
              <TooltipContent>Proposal Author</TooltipContent>
            </Tooltip>
  
            {/* Budget */}
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span>{proposal.budgetRequest} MINA</span>
              </TooltipTrigger>
              <TooltipContent>Requested Budget</TooltipContent>
            </Tooltip>
  
            {/* Reviewer Votes */}
            <HoverCard>
              <HoverCardTrigger className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {proposal.reviewerVotes.approved}/{proposal.reviewerVotes.total}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="space-y-2">
                  <h4 className="font-medium">Reviewer Votes</h4>
                  <div className="text-sm">
                    <div>Approved: {proposal.reviewerVotes.approved}</div>
                    <div>Rejected: {proposal.reviewerVotes.rejected}</div>
                    <div>Total: {proposal.reviewerVotes.total}</div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
  
            {/* Community Votes */}
            <HoverCard>
              <HoverCardTrigger className="flex items-center gap-1">
                <span>🌍</span>
                <span>{proposal.communityVotes.totalVotes} votes</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="space-y-2">
                  <h4 className="font-medium">Community Votes</h4>
                  <div className="text-sm">
                    <div>Total Votes: {proposal.communityVotes.totalVotes}</div>
                    <div>
                      Stake Weight: {proposal.communityVotes.positiveStakeWeight}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </TooltipProvider>
        </div>
      </>
    )
  }