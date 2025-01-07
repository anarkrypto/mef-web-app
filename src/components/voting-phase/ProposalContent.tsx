"use client"

import {
  GripVertical,
  Wallet,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Users,
  Coins,
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
            {/* Proposal ID */}
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <span className="text-xs">#{proposal.id}</span>
              </TooltipTrigger>
              <TooltipContent>Proposal ID</TooltipContent>
            </Tooltip>
  
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