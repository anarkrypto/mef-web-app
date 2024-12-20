'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useToast } from "@/hooks/use-toast"
import type { Proposal } from "@prisma/client"
import { useActionFeedback } from '@/hooks/use-action-feedback'
import { SelectFundingRoundDialog } from "@/components/dialogs/SelectFundingRoundDialog"
import { ViewFundingRoundDialog } from "@/components/dialogs/ViewFundingRoundDialog"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFundingRounds } from "@/hooks/use-funding-rounds"
import type { UserMetadata } from '@/services/UserService'

interface LinkedAccount {
  id: string;
  authSource: {
    type: string;
    id: string;
    username: string;
  };
}

interface ProposalWithAccess extends Proposal {
  isOwner: boolean;
  user: {
    id: string;
    linkId: string;
    metadata: UserMetadata;
    linkedAccounts: LinkedAccount[];
  };
  fundingRound?: {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    considerationPhase: {
      startDate: string;
      endDate: string;
    };
    deliberationPhase: {
      startDate: string;
      endDate: string;
    };
    votingPhase: {
      startDate: string;
      endDate: string;
    };
  };
}

interface Props {
  proposalId: string;
}

export function ProposalDetails({ proposalId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [proposal, setProposal] = useState<ProposalWithAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectFundingRoundOpen, setSelectFundingRoundOpen] = useState(false);
  const [viewFundingRoundOpen, setViewFundingRoundOpen] = useState(false);
  const { loading: checkingRounds, hasAvailableRounds } = useFundingRounds();

  const { handleAction } = useActionFeedback({
    successMessage: "Action will be implemented soon",
    errorMessage: "Failed to perform action"
  });

const fetchProposal = useCallback(async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`)
      if (!response.ok) throw new Error('Failed to fetch proposal')
      const data = await response.json()
      
      // Validate that we have the required data
      if (!data.user?.metadata?.authSource) {
        throw new Error('Invalid proposal data structure')
      }
      
      setProposal(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load proposal",
        variant: "destructive"
      })
      router.push('/proposals')
    } finally {
      setLoading(false)
    }
  }, [toast, router, proposalId]);

  const handleSubmitToFunding = async (roundId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fundingRoundId: roundId }),
      });

      if (!response.ok) throw new Error('Failed to submit proposal');

      toast({
        title: "Success",
        description: "Proposal submitted to funding round",
      });

      // Refresh proposal data
      fetchProposal();
    } catch (error) {
      throw error; // Let the dialog handle the error
    }
  };

  const handleWithdrawFromFunding = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/withdraw`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to withdraw proposal');

      toast({
        title: "Success",
        description: "Proposal withdrawn from funding round",
      });

      // Refresh proposal data
      fetchProposal();
    } catch (error) {
      throw error; // Let the dialog handle the error
    }
  };

  useEffect(() => {
    fetchProposal()
  }, [proposalId, fetchProposal]) 

  const handleSubmitClick = () => {
    if (!hasAvailableRounds) {
      toast({
        title: "No Available Funding Rounds",
        description: "There are currently no funding rounds accepting proposals. Please check back later.",
        variant: "default",
      });
      return;
    }
    setSelectFundingRoundOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading proposal...</div>
  }

  if (!proposal) {
    return <div className="text-center py-8">Proposal not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Proposal Details</h1>
        <Link href="/proposals" className="text-muted-foreground hover:text-foreground underline">
          Back to proposals list
        </Link>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{proposal.proposalName}</h2>
          <p className="text-muted-foreground">by {proposal.user.metadata?.username}</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded-full bg-muted text-sm">
              Status: {proposal.status.toLowerCase()}
            </span>
            {proposal.fundingRound && (
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setViewFundingRoundOpen(true)}
              >
                <Badge variant="outline" className="cursor-pointer">
                  {proposal.fundingRound.name}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Abstract</h3>
            <p className="text-muted-foreground">{proposal.abstract}</p>
          </div>

          {isExpanded && (
            <>
              <div>
                <h3 className="text-xl font-semibold mb-2">Motivation</h3>
                <p className="text-muted-foreground">{proposal.motivation}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Rationale</h3>
                <p className="text-muted-foreground">{proposal.rationale}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Delivery requirements</h3>
                <p className="text-muted-foreground">{proposal.deliveryRequirements}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Security and Performance considerations</h3>
                <p className="text-muted-foreground">{proposal.securityAndPerformance}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Budget request</h3>
                <p className="text-muted-foreground">{proposal.budgetRequest.toString()} MINA</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {/* Show Discord info if author is a Discord user */}
                  {proposal.user.metadata.authSource.type === 'discord' ? (
                    <p className="text-muted-foreground">
                      Discord: {proposal.user.metadata.authSource.username}
                    </p>
                  ) : (
                    /* Check for linked Discord account */
                    proposal.user.linkedAccounts?.some(account => account.authSource.type === 'discord') ? (
                      <p className="text-muted-foreground">
                        Discord: {proposal.user.linkedAccounts.find(account => 
                          account.authSource.type === 'discord'
                        )?.authSource.username} (linked account)
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        No Discord account linked
                      </p>
                    )
                  )}
                  <p className="text-muted-foreground">Email: {proposal.email}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                See less
                <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                See more
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>

          {proposal.status === 'DRAFT' && (
            <div className="flex gap-4">
              {proposal.isOwner && (
                <Link href={`/proposals/${proposal.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              )}
              {proposal.fundingRound ? (
                <Button
                  onClick={() => setViewFundingRoundOpen(true)}
                  variant="secondary"
                >
                  View Funding Round Details
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          onClick={handleSubmitClick}
                          disabled={checkingRounds || !hasAvailableRounds}
                        >
                          {checkingRounds ? "Checking rounds..." : "Submit to funding round"}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!hasAvailableRounds && (
                      <TooltipContent>
                        <p>No funding rounds are currently accepting proposals</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </div>

      <SelectFundingRoundDialog
        open={selectFundingRoundOpen}
        onOpenChange={setSelectFundingRoundOpen}
        onSubmit={handleSubmitToFunding}
        proposalTitle={proposal.proposalName}
      />
      
      {proposal.fundingRound && (
        <ViewFundingRoundDialog
          open={viewFundingRoundOpen}
          onOpenChange={setViewFundingRoundOpen}
          fundingRound={proposal.fundingRound}
          proposalTitle={proposal.proposalName}
          onWithdraw={handleWithdrawFromFunding}
          canWithdraw={proposal.isOwner}
        />
      )}
    </div>
  )
}