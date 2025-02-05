"use client"

import React, { useCallback, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, Save } from "lucide-react"
import { ProposalContent } from "./ProposalContent"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isTouchDevice } from "@/lib/utils"
import { useWallet } from '@/contexts/WalletContext'
import { RankedVoteTransactionDialog } from "@/components/web3/dialogs/RankedVoteTransactionDialog"
import { WalletConnectorDialog } from "@/components/web3/WalletConnectorDialog"
import { ManualVoteDialog, ManualVoteDialogVoteType } from "@/components/web3/dialogs/OCVManualInstructions"
import { GetRankedEligibleProposalsAPIResponse } from "@/services/RankedVotingService"
import { ProposalWithUniqueId } from "./types"
import { formatDistanceToNow } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"


interface RankedVoteListProps {
  fundingRoundMEFId: number
  proposals?: GetRankedEligibleProposalsAPIResponse | null
  existingVote?: {
    account: string
    proposals: number[]
    hash: string
    memo: string
    height: number
    status: string
    timestamp: number
    nonce: number
  }
  onSubmit: (selectedProposals: GetRankedEligibleProposalsAPIResponse) => void
  onSaveToMemo: (selectedProposals: GetRankedEligibleProposalsAPIResponse) => void
  onConnectWallet: () => void
  title?: string
}

interface DragItem {
  index: number
  id: string
  type: string
  sourceList: "available" | "ranked"
}

const ItemTypes = {
  PROPOSAL: 'proposal',
}

const DropTarget = ({
  children,
  onDrop,
  className,
}: {
  children: React.ReactNode
  onDrop?: (item: DragItem) => void
  className: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ItemTypes.PROPOSAL,
    drop: (item) => {
      if (onDrop) {
        onDrop(item);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  })

  drop(ref)

  return (
    <div 
      ref={ref}
      className={`${className} ${isOver && onDrop ? 'ring-2 ring-purple-400' : ''}`}
    >
      {children}
    </div>
  )
}

const DraggableProposal = ({ 
  proposal, 
  index, 
  isRanked,
  moveProposal,
  onDoubleClick,
  disabled = false
}: { 
  proposal: ProposalWithUniqueId
  index: number
  isRanked: boolean
  moveProposal: (dragIndex: number, hoverIndex: number) => void
  onDoubleClick: () => void
  disabled?: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROPOSAL,
    item: { 
      type: ItemTypes.PROPOSAL,
      id: proposal.uniqueId,
      index,
      sourceList: isRanked ? "ranked" : "available"
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled
  })

  const [, drop] = useDrop({
    accept: ItemTypes.PROPOSAL,
    hover: (item: DragItem, monitor) => {
      if (!ref.current || disabled) return
      if (!isRanked) return // Only allow reordering in ranked list
      
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveProposal(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      onDoubleClick={disabled ? undefined : onDoubleClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`
        group select-none flex flex-col gap-2 p-3 bg-white border rounded-lg
        ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing'}
        shadow-sm
        hover:shadow-md hover:bg-${isRanked ? 'purple' : 'blue'}-50 
        hover:border-${isRanked ? 'purple' : 'blue'}-300
        transition-all duration-200
        ${isDragging ? 'ring-2 ring-purple-400' : ''}
        ${disabled ? 'ring-2 ring-purple-200' : ''}
      `}
    >
      <ProposalContent
        proposal={proposal}
        index={index}
        isRanked={isRanked}
      />
    </div>
  )
}

const DndContent = ({
  fundingRoundMEFId,
  availableProposals,
  rankedProposals,
  existingVote,
  onMoveProposal,
  onDoubleClick,
  onDropToRanked,
  onDropToAvailable,
  onConnectWallet,
  onSaveToMemo,
}: {
  fundingRoundMEFId: number,
  availableProposals: ProposalWithUniqueId[]
  rankedProposals: ProposalWithUniqueId[]
  existingVote?: {
    account: string;
    proposals: number[];
    hash: string;
    memo: string;
    height: number;
    status: string;
    timestamp: number;
    nonce: number;
  };
  onMoveProposal: (dragIndex: number, hoverIndex: number) => void
  onDoubleClick: (proposal: ProposalWithUniqueId, source: "available" | "ranked") => void
  onDropToRanked: (item: DragItem) => void
  onDropToAvailable: (item: DragItem) => void
  onConnectWallet: () => void
  onSaveToMemo: (proposals: GetRankedEligibleProposalsAPIResponse) => void
}) => {
  const { state } = useWallet();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);

  const handleVoteClick = () => {
    if (!state.wallet) {
      setShowWalletDialog(true);
      return;
    }
    setShowTransactionDialog(true);
  };

  const handleSaveToMemo = () => {
    setShowManualDialog(true);
  };

  // Create a string of ranked proposal IDs
  const rankedVoteId: string = [fundingRoundMEFId, ...rankedProposals.map(p => p.id)].join(' ');

  const isVoteDisabled = Boolean(existingVote);
  const voteButtonTooltip = existingVote 
    ? `You have already voted ${formatDistanceToNow(existingVote.timestamp)} ago` 
    : undefined;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* LEFT COLUMN - AVAILABLE PROPOSALS */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          Available Candidates ({availableProposals.length})
        </h2>
        <DropTarget
          onDrop={existingVote ? undefined : onDropToAvailable}
          className="space-y-2 min-h-[400px] p-4 border-2 border-dashed border-blue-200 rounded-lg
                     transition-colors duration-300 hover:border-blue-300"
        >
          {availableProposals.map((proposal, index) => (
            <DraggableProposal
              key={proposal.uniqueId}
              proposal={proposal}
              index={index}
              isRanked={false}
              moveProposal={onMoveProposal}
              onDoubleClick={() => onDoubleClick(proposal, "available")}
              disabled={Boolean(existingVote)}
            />
          ))}
        </DropTarget>
      </Card>

      {/* RIGHT COLUMN - RANKED PROPOSALS */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">
          Your Ranked Choices ({rankedProposals.length})
        </h2>
        <DropTarget
          onDrop={existingVote ? undefined : onDropToRanked}
          className="space-y-2 min-h-[400px] p-4 border-2 border-dashed border-purple-200 rounded-lg
                     transition-colors duration-300 hover:border-purple-300 mb-6"
        >
          {rankedProposals.map((proposal, index) => (
            <DraggableProposal
              key={proposal.uniqueId}
              proposal={proposal}
              index={index}
              isRanked={true}
              moveProposal={onMoveProposal}
              onDoubleClick={() => onDoubleClick(proposal, "ranked")}
              disabled={Boolean(existingVote)}
            />
          ))}
        </DropTarget>

        <div className="space-y-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700
                              transition-all duration-300 transform hover:scale-105"
                    onClick={handleVoteClick}
                    disabled={isVoteDisabled}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {state.wallet ? 'Vote with Wallet' : 'Connect Wallet to Submit Vote'}
                  </Button>
                </div>
              </TooltipTrigger>
              {voteButtonTooltip && (
                <TooltipContent>
                  <p>{voteButtonTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSaveToMemo}
            disabled={isVoteDisabled}
          >
            <Save className="w-4 h-4 mr-2" />
            Vote Via Memo Without A Wallet
          </Button>
        </div>

        <WalletConnectorDialog 
          open={showWalletDialog} 
          onOpenChange={setShowWalletDialog}
        />

        <RankedVoteTransactionDialog
          open={showTransactionDialog}
          onOpenChange={setShowTransactionDialog}
          selectedProposals={rankedProposals}
          fundingRoundMEFId={fundingRoundMEFId}
        />

        <ManualVoteDialog
          open={showManualDialog}
          onOpenChange={setShowManualDialog}
          voteId={rankedVoteId}
          voteType={ManualVoteDialogVoteType.MEF}
          existingVote={existingVote ? {
            address: existingVote.account,
            timestamp: existingVote.timestamp,
            hash: existingVote.hash
          } : null}
        />
      </Card>
    </div>
  );
}

const MAX_RANKED_CHOICES = 10

export default function RankedVoteList({
  fundingRoundMEFId,
  proposals,
  existingVote,
  onSubmit,
  onSaveToMemo,
  onConnectWallet,
  title = "Rank your vote",
}: RankedVoteListProps) {
  const { state } = useWallet();

  // Move all hooks to the top level
  const [availableProposals, setAvailableProposals] = React.useState<ProposalWithUniqueId[]>([]);
  const [rankedProposals, setRankedProposals] = React.useState<ProposalWithUniqueId[]>([]);

  // Add effect to update proposals when they change
  React.useEffect(() => {
    if (proposals) {
      // If there's an existing vote, initialize ranked proposals with the voted ones
      if (existingVote) {
        // Convert proposal IDs to strings for comparison
        const votedProposalIds = existingVote.proposals.map(id => id.toString());
        
        const votedProposals = proposals.proposals
          .filter(p => votedProposalIds.includes(p.id.toString()))
          .sort((a, b) => {
            const aIndex = votedProposalIds.indexOf(a.id.toString());
            const bIndex = votedProposalIds.indexOf(b.id.toString());
            return aIndex - bIndex;
          })
          .map(p => ({
            ...p,
            uniqueId: `ranked-${p.id}-${Math.random().toString(36).substr(2, 9)}`,
          }));

        const availableProposals = proposals.proposals
          .filter(p => !votedProposalIds.includes(p.id.toString()))
          .map(p => ({
            ...p,
            uniqueId: `available-${p.id}-${Math.random().toString(36).substr(2, 9)}`,
          }));

        setRankedProposals(votedProposals);
        setAvailableProposals(availableProposals);
      } else {
        setAvailableProposals(
          proposals.proposals.map((p) => ({
            ...p,
            uniqueId: `available-${p.id}-${Math.random().toString(36).substr(2, 9)}`,
          }))
        );
        // Reset ranked proposals when switching funding rounds
        setRankedProposals([]);
      }
    }
  }, [proposals, existingVote]);

  const moveRankedProposal = useCallback((dragIndex: number, hoverIndex: number) => {
    setRankedProposals((prevProposals) => {
      const newProposals = [...prevProposals];
      const [removed] = newProposals.splice(dragIndex, 1);
      newProposals.splice(hoverIndex, 0, removed);
      return newProposals;
    });
  }, []);

  const handleDropToRanked = useCallback((item: DragItem) => {
    const draggedProposal = item.sourceList === "available" 
      ? availableProposals.find(p => p.uniqueId === item.id)
      : rankedProposals.find(p => p.uniqueId === item.id);

    if (!draggedProposal) return;

    if (item.sourceList === "available") {
      if (rankedProposals.length >= MAX_RANKED_CHOICES) return;

      setAvailableProposals(prev => prev.filter(p => p.uniqueId !== item.id));
      setRankedProposals(prev => [...prev, draggedProposal]);
    }
  }, [availableProposals, rankedProposals]);

  const handleDropToAvailable = useCallback((item: DragItem) => {
    if (item.sourceList === "ranked") {
      const draggedProposal = rankedProposals.find(p => p.uniqueId === item.id);
      if (!draggedProposal) return;

      setRankedProposals(prev => prev.filter(p => p.uniqueId !== item.id));
      setAvailableProposals(prev => [...prev, draggedProposal]);
    }
  }, [rankedProposals]);

  const handleDoubleClick = useCallback((proposal: ProposalWithUniqueId, source: "available" | "ranked") => {
    if (source === "available") {
      if (rankedProposals.length >= MAX_RANKED_CHOICES) return;
      setAvailableProposals(prev => prev.filter(p => p.uniqueId !== proposal.uniqueId));
      setRankedProposals(prev => [...prev, proposal]);
    } else {
      setRankedProposals(prev => prev.filter(p => p.uniqueId !== proposal.uniqueId));
      setAvailableProposals(prev => [...prev, proposal]);
    }
  }, [rankedProposals.length]);

  // If no proposals are provided, show a message
  if (!proposals) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">No Proposals Available</h2>
            <p className="text-gray-600">
              There are currently no proposals available in the voting phase.
              Please check back later when proposals have been added.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const progressPercentage = (rankedProposals.length / MAX_RANKED_CHOICES) * 100;
  const remainingChoices = MAX_RANKED_CHOICES - rankedProposals.length;

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <div className="space-y-4 text-gray-600 mb-8">
          <p>
            Drag and drop proposals to move them into the Ranked list, or double-click an item to move it.
            Under <strong>&apos;Your Ranked Choices&apos;</strong>, items should be reordered according to preference, where 1 is the highest preference project to be funded and the last position is the least preference project to be funded.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <strong>Important:</strong> Once you submit your vote, it cannot be changed. After submitting, it may take up to 10 minutes for your vote to be processed and appear under &quot;Your Ranked Choices&quot;.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Ranked Choices Progress
            </span>
            <span className="text-sm font-medium text-gray-700">
              {rankedProposals.length} / {MAX_RANKED_CHOICES}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {remainingChoices > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You can add {remainingChoices} more candidate
              {remainingChoices !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <DndContent
          fundingRoundMEFId={fundingRoundMEFId}
          availableProposals={availableProposals}
          rankedProposals={rankedProposals}
          existingVote={existingVote}
          onMoveProposal={moveRankedProposal}
          onDoubleClick={handleDoubleClick}
          onDropToRanked={handleDropToRanked}
          onDropToAvailable={handleDropToAvailable}
          onConnectWallet={onConnectWallet}
          onSaveToMemo={onSaveToMemo}
        />
      </div>
    </DndProvider>
  )
}