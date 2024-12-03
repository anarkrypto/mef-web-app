'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Proposal } from "@prisma/client"
import { SelectFundingRoundDialog } from "@/components/dialogs/SelectFundingRoundDialog"
import { ViewFundingRoundDialog } from "@/components/dialogs/ViewFundingRoundDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useActionFeedback } from '@/hooks/use-action-feedback'
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFundingRounds } from "@/hooks/use-funding-rounds"

interface ProposalWithUser {
  id: number;
  userId: string;
  fundingRoundId: string | null;
  status: string;
  proposalName: string;
  abstract: string;
  motivation: string;
  rationale: string;
  deliveryRequirements: string;
  securityAndPerformance: string;
  budgetRequest: string;
  discord: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    linkId: string;
    metadata: {
      username: string;
      createdAt: string;
      authSource: {
        type: string;
        id: string;
        username: string;
      };
    };
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

export function ProposalsList() {
  const { toast } = useToast()
  const [proposals, setProposals] = useState<ProposalWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null)
  const [viewFundingRoundOpen, setViewFundingRoundOpen] = useState(false)
  const [selectFundingRoundOpen, setSelectFundingRoundOpen] = useState(false)
  const { loading: checkingRounds, hasAvailableRounds } = useFundingRounds();

  const { handleAction, loading: deleteLoading } = useActionFeedback({
    successMessage: "Proposal deleted successfully",
    errorMessage: "Failed to delete proposal",
    requireConfirmation: true,
    confirmMessage: "Are you sure you want to delete this proposal? This action cannot be undone."
  })

  const fetchProposals = useCallback(async () => {
    try {
      const response = await fetch('/api/proposals')
      if (!response.ok) throw new Error('Failed to fetch proposals')
      const data = await response.json()
      setProposals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast]);

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])
 

  const handleDelete = async (id: number) => {
    await handleAction(async () => {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete proposal')
      }

      setProposals(prev => prev.filter(p => p.id !== id))
    })
  }

  const handleSubmitToFunding = async (roundId: string) => {
    if (!selectedProposalId) return;

    try {
      const response = await fetch(`/api/proposals/${selectedProposalId}/submit`, {
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

      // Refresh proposals list
      fetchProposals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal to funding round",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawFromFunding = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/withdraw`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to withdraw proposal');

      toast({
        title: "Success",
        description: "Proposal withdrawn from funding round",
      });

      // Refresh proposals list
      fetchProposals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw proposal",
        variant: "destructive",
      });
    }
  };

  const handleSubmitClick = (proposalId: number) => {
    if (!hasAvailableRounds) {
      toast({
        title: "No Available Funding Rounds",
        description: "There are currently no funding rounds accepting proposals. Please check back later.",
        variant: "default",
      });
      return;
    }
    setSelectedProposalId(proposalId);
    setSelectFundingRoundOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading proposals...</div>
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No proposals found</p>
        <Link href="/proposals/create">
          <Button>Create your first proposal</Button>
        </Link>
      </div>
    )
  }

  const selectedProposal = selectedProposalId 
    ? proposals.find(p => p.id === selectedProposalId)
    : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Proposals</h1>
        <Link href="/proposals/create">
          <Button className="bg-gray-600 text-white hover:bg-gray-700">
            Create a proposal
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-background"
          >
            <div className="flex flex-col">
              <Link
                href={`/proposals/${proposal.id}`}
                className="text-lg font-medium hover:underline"
              >
                {proposal.proposalName}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>by {proposal.user.metadata.username}</span>
                <span>•</span>
                <span>Status: {proposal.status.toLowerCase()}</span>
                {proposal.fundingRound && (
                  <>
                    <span>•</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => {
                        setSelectedProposalId(proposal.id);
                        setViewFundingRoundOpen(true);
                      }}
                    >
                      <Badge variant="outline" className="cursor-pointer">
                        {proposal.fundingRound.name}
                      </Badge>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {proposal.status === 'DRAFT' && (
                <>
                  <Link
                    href={`/proposals/${proposal.id}/edit`}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    Edit
                  </Link>
                  
                  {proposal.fundingRound ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedProposalId(proposal.id);
                        setViewFundingRoundOpen(true);
                      }}
                    >
                      View Funding Round Details
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="secondary"
                              onClick={() => handleSubmitClick(proposal.id)}
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
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(proposal.id)}
                    disabled={deleteLoading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {deleteLoading ? (
                      <span className="animate-spin">⌛</span>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                    <span className="sr-only">Delete proposal</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your proposal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SelectFundingRoundDialog
        open={selectFundingRoundOpen}
        onOpenChange={setSelectFundingRoundOpen}
        onSubmit={handleSubmitToFunding}
        proposalTitle={selectedProposal?.proposalName || ''}
      />
   
      {selectedProposal?.fundingRound && (
        <ViewFundingRoundDialog
          open={viewFundingRoundOpen}
          onOpenChange={setViewFundingRoundOpen}
          fundingRound={selectedProposal.fundingRound}
          proposalTitle={selectedProposal.proposalName}
          canWithdraw={true}
          mode="withdraw"
          onWithdraw={() => handleWithdrawFromFunding(selectedProposal.id)}
        />
      )}
    </div>
  )
}