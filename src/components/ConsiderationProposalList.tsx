'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useConsiderationPhase } from '@/hooks/use-consideration-phase'
import { useConsiderationVote } from '@/hooks/use-consideration-vote'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ConsiderationProposal } from '@/types/consideration';

interface Props {
  fundingRoundId: string;
  fundingRoundName: string;
}

type ReviewState = 'initial' | 'decided' | 'editing';

interface ExpandedState {
  [key: number]: boolean;
}

function calculateVoteStats(proposal: ConsiderationProposal, newVote?: { decision: 'APPROVED' | 'REJECTED' }) {
  const stats = { ...proposal.voteStats };
  
  if (proposal.userVote && newVote) {
    if (proposal.userVote.decision === 'APPROVED') stats.approved--;
    if (proposal.userVote.decision === 'REJECTED') stats.rejected--;
    stats.total--;
  }
  
  if (newVote) {
    if (newVote.decision === 'APPROVED') stats.approved++;
    if (newVote.decision === 'REJECTED') stats.rejected++;
    stats.total++;
  }
  
  return stats;
}

export function ConsiderationProposalList({ fundingRoundId, fundingRoundName }: Props) {
  const { proposals, loading, setProposals } = useConsiderationPhase(fundingRoundId);
  const [reviewStates, setReviewStates] = useState<Record<number, ReviewState>>({});
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [newDecision, setNewDecision] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const { submitVote, isLoading: isSubmitting } = useConsiderationVote({ fundingRoundId });

  useEffect(() => {
    proposals.forEach((proposal: ConsiderationProposal) => {
      if (proposal.userVote) {
        setReviewStates(prev => ({ ...prev, [proposal.id]: 'decided' }));
        setDecisions(prev => ({ ...prev, [proposal.id]: proposal.userVote!.feedback }));
      }
    });
  }, [proposals]);

  const toggleExpanded = (proposalId: number) => {
    setExpanded(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }));
  };

  const handleDecision = async (proposalId: number, decision: 'APPROVED' | 'REJECTED') => {
    if (!decisions[proposalId]?.trim()) {
      alert('Please provide feedback before making a decision');
      return;
    }

    const result = await submitVote(proposalId, decision, decisions[proposalId]);
    if (result) {
      setProposals((prev: ConsiderationProposal[]) => {
        const updatedProposals = prev.filter((p: ConsiderationProposal) => p.id !== proposalId);
        const votedProposal = prev.find((p: ConsiderationProposal) => p.id === proposalId);
        if (votedProposal) {
          const newVoteStats = calculateVoteStats(votedProposal, { decision });
          return [
            ...updatedProposals,
            { 
              ...votedProposal, 
              status: decision.toLowerCase() as 'approved' | 'rejected',
              userVote: {
                decision,
                feedback: decisions[proposalId]
              },
              voteStats: newVoteStats
            }
          ];
        }
        return prev;
      });
      setReviewStates(prev => ({ ...prev, [proposalId]: 'decided' }));
    }
  };

  const startEdit = (proposalId: number) => {
    setNewDecision(prev => ({
      ...prev,
      [proposalId]: ''
    }));
    setReviewStates(prev => ({ ...prev, [proposalId]: 'editing' }));
  };

  const cancelEdit = (proposalId: number) => {
    setNewDecision(prev => ({
      ...prev,
      [proposalId]: ''
    }));
    setReviewStates(prev => ({ ...prev, [proposalId]: 'decided' }));
  };

  const submitNewDecision = async (proposalId: number, decision: 'APPROVED' | 'REJECTED') => {
    if (!newDecision[proposalId]?.trim()) {
      alert('Please provide feedback before submitting');
      return;
    }

    const result = await submitVote(proposalId, decision, newDecision[proposalId]);
    if (result) {
      setProposals((prev: ConsiderationProposal[]) => 
        prev.map((p: ConsiderationProposal) => {
          if (p.id === proposalId) {
            const newVoteStats = calculateVoteStats(p, { decision });
            return { 
              ...p, 
              status: decision.toLowerCase() as 'approved' | 'rejected',
              userVote: {
                decision,
                feedback: newDecision[proposalId]
              },
              voteStats: newVoteStats
            };
          }
          return p;
        })
      );
      setDecisions(prev => ({
        ...prev,
        [proposalId]: newDecision[proposalId]
      }));
      setNewDecision(prev => ({
        ...prev,
        [proposalId]: ''
      }));
    }
  };

  const renderVoteButtons = (proposal: ConsiderationProposal) => {
    if (!proposal.isReviewerEligible) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="bg-green-600/50 hover:bg-green-700/50 cursor-not-allowed"
                  disabled
                >
                  ✅ Approve for Deliberation
                </Button>
                <Button
                  variant="destructive"
                  className="opacity-50 cursor-not-allowed"
                  disabled
                >
                  ❌ Reject for Deliberation
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Community voting with wallet integration is coming soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <>
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleDecision(proposal.id, 'APPROVED')}
        >
          ✅ Approve for Deliberation
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleDecision(proposal.id, 'REJECTED')}
        >
          ❌ Reject for Deliberation
        </Button>
      </>
    );
  };

  const renderEditButtons = (proposal: ConsiderationProposal) => {
    if (!proposal.isReviewerEligible) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="bg-green-600/50 hover:bg-green-700/50 cursor-not-allowed"
                  disabled
                >
                  ✅ Approve for Deliberation
                </Button>
                <Button
                  variant="destructive"
                  className="opacity-50 cursor-not-allowed"
                  disabled
                >
                  ❌ Reject for Deliberation
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Community voting with wallet integration is coming soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => submitNewDecision(proposal.id, 'APPROVED')}
          disabled={isSubmitting}
        >
          ✅ Approve for Deliberation
        </Button>
        <Button
          variant="destructive"
          onClick={() => submitNewDecision(proposal.id, 'REJECTED')}
          disabled={isSubmitting}
        >
          ❌ Reject for Deliberation
        </Button>
      </div>
    );
  };

  const renderFeedbackSection = (proposal: ConsiderationProposal) => {
    if (!proposal.isReviewerEligible) {
      if (proposal.status !== 'pending') {
        return (
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">📋 Status:</h4>
            <div className="flex items-center gap-2">
              <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
                {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'} for Deliberation
              </Badge>
            </div>
          </div>
        );
      }
      return (
        <div className="bg-muted p-4 rounded-md">
          <p className="text-muted-foreground">
            💡 Community members can vote using their wallet once the feature is available.
          </p>
        </div>
      );
    }

    if (reviewStates[proposal.id] === 'editing') {
      return (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">📝 Current Decision:</h4>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
                {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{decisions[proposal.id]}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`new-decision-${proposal.id}`}>New Feedback</Label>
            <Textarea
              id={`new-decision-${proposal.id}`}
              placeholder="Enter your new feedback..."
              value={newDecision[proposal.id] || ''}
              onChange={(e) => setNewDecision(prev => ({
                ...prev,
                [proposal.id]: e.target.value
              }))}
              className="min-h-[100px]"
            />
          </div>
        </div>
      );
    }

    if (reviewStates[proposal.id] === 'decided') {
      return (
        <div className="bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">📋 Decision:</h4>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
              {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{decisions[proposal.id] || proposal.userVote?.feedback}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={`feedback-${proposal.id}`}>Your Feedback</Label>
        <Textarea
          id={`feedback-${proposal.id}`}
          placeholder="Enter your feedback..."
          value={decisions[proposal.id] || ''}
          onChange={(e) => setDecisions(prev => ({
            ...prev,
            [proposal.id]: e.target.value
          }))}
          className="min-h-[100px]"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            🤔 Consideration Phase: {fundingRoundName}
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              ({proposals.length} proposals, {proposals.filter((p: ConsiderationProposal) => p.status === 'pending').length} pending review)
            </span>
          </h1>
        </div>

        <div className="space-y-6">
          {proposals.map((proposal: ConsiderationProposal) => (
            <Card key={proposal.id} className={cn(
              "hover:bg-muted/50 transition-colors",
              proposal.status === 'approved' && "border-green-500/20 bg-green-50/50 dark:bg-green-900/10",
              proposal.status === 'rejected' && "border-red-500/20 bg-red-50/50 dark:bg-red-900/10"
            )}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{proposal.proposalName}</CardTitle>
                    <CardDescription>
                      👤 Submitted by {proposal.submitter}
                    </CardDescription>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          <span className="text-green-600 flex items-center gap-1">
                            <span>✓ {proposal.voteStats.approved}</span>
                            {proposal.voteStats.total > 0 && (
                              <span className="text-muted-foreground">
                                ({Math.round((proposal.voteStats.approved / proposal.voteStats.total) * 100)}%)
                              </span>
                            )}
                          </span>
                          <span className="text-red-600 flex items-center gap-1">
                            <span>✗ {proposal.voteStats.rejected}</span>
                            {proposal.voteStats.total > 0 && (
                              <span className="text-muted-foreground">
                                ({Math.round((proposal.voteStats.rejected / proposal.voteStats.total) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {proposal.voteStats.total} total {proposal.voteStats.total === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div className="absolute inset-0 flex w-full">
                          <div 
                            className="bg-green-500 transition-all duration-300" 
                            style={{ 
                              width: `${proposal.voteStats.total > 0 
                                ? (proposal.voteStats.approved / proposal.voteStats.total) * 100 
                                : 0}%` 
                            }} 
                          />
                          <div 
                            className="bg-red-500 transition-all duration-300" 
                            style={{ 
                              width: `${proposal.voteStats.total > 0 
                                ? (proposal.voteStats.rejected / proposal.voteStats.total) * 100 
                                : 0}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {proposal.status !== 'pending' && (
                    <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
                      {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Abstract</h3>
                  {expanded[proposal.id] ? (
                    <>
                      <p className="text-muted-foreground mb-4">{proposal.abstract}</p>
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="text-primary hover:underline"
                      >
                        View full proposal details ↗
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted-foreground line-clamp-3">{proposal.abstract}</p>
                  )}
                </div>

                {renderFeedbackSection(proposal)}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="gap-2"
                  onClick={() => toggleExpanded(proposal.id)}
                >
                  {expanded[proposal.id] ? (
                    <>
                      See less
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      See more
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-4">
                  {reviewStates[proposal.id] === 'editing' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => cancelEdit(proposal.id)}
                      >
                        ❌ Cancel
                      </Button>
                      {renderEditButtons(proposal)}
                    </>
                  ) : reviewStates[proposal.id] === 'decided' ? (
                    <>
                      {proposal.isReviewerEligible && (
                        <Button
                          variant="ghost"
                          className="underline"
                          onClick={() => startEdit(proposal.id)}
                        >
                          ✏️ Edit Decision
                        </Button>
                      )}
                      <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
                        {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'} for Deliberation
                      </Badge>
                    </>
                  ) : (
                    <>
                      {renderVoteButtons(proposal)}
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}