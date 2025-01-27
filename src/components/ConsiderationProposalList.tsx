'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import type { ConsiderationProposal } from '@/types/consideration';
import { OCVVoteButton } from "@/components/web3/OCVVoteButton"
import { ProposalStatus } from '@prisma/client';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface Props {
  fundingRoundId: string;
  fundingRoundMEFId: number;
  fundingRoundName: string;
}

type ReviewState = 'initial' | 'decided' | 'editing';

interface ExpandedState {
  [key: number]: boolean;
}

function calculateVoteStats(
  proposal: ConsiderationProposal, 
  newVote?: { decision: 'APPROVED' | 'REJECTED' }
) {
  const stats = { ...proposal.voteStats };
  
  // Update vote counts
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

  // Recalculate reviewer eligibility based on new vote counts
  stats.reviewerEligible = stats.approved >= stats.requiredReviewerApprovals;
  
  return stats;
}

// Add this helper component for vote stats
function VoteStatusCard({ 
  icon, 
  title, 
  eligibilityStatus, 
  isEligible, 
  stats, 
  children 
}: {
  icon: string;
  title: string;
  eligibilityStatus: string;
  isEligible: boolean;
  stats?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <Badge 
          variant={isEligible ? "default" : "secondary"}
          className={cn(
            "transition-all",
            isEligible && "bg-green-500/15 text-green-600 hover:bg-green-500/25",
            !isEligible && "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
          )}
        >
          {eligibilityStatus}
        </Badge>
      </div>
      {stats}
      {children}
    </div>
  );
}

// Add this helper component for vote progress
function VoteProgress({ approved, rejected, total }: { approved: number; rejected: number; total: number }) {
  const approvedPercent = total > 0 ? (approved / total) * 100 : 0;
  const rejectedPercent = total > 0 ? (rejected / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span className="text-green-600 font-medium">
            {approved} Approved ({Math.round(approvedPercent)}%)
          </span>
          <span className="text-red-600 font-medium">
            {rejected} Rejected ({Math.round(rejectedPercent)}%)
          </span>
        </div>
        <span>&nbsp;{total} total</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-0 flex w-full">
          <div 
            className="bg-green-500 transition-all duration-300" 
            style={{ width: `${approvedPercent}%` }} 
          />
          <div 
            className="bg-red-500 transition-all duration-300" 
            style={{ width: `${rejectedPercent}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

// First, add this helper component for formatting timestamps
function FormattedTimestamp({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  return (
    <span className="text-xs text-muted-foreground whitespace-nowrap">
      {date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </span>
  );
}

// Add this helper function at the top level
function formatAddress(address: string): string {
  if (!address) return '';
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

// Add this component for the address display
function VoterAddress({ address }: { address: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="flex-1 min-w-0">
      <code 
        className={cn(
          "font-mono text-xs bg-muted px-1.5 py-0.5 rounded cursor-pointer transition-all hover:bg-muted/80 inline-block max-w-full",
          isExpanded ? "break-all" : "truncate"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Click to collapse" : "Click to expand"}
      >
        {isExpanded ? address : formatAddress(address)}
      </code>
    </div>
  );
}

export function ConsiderationProposalList({ fundingRoundId, fundingRoundMEFId, fundingRoundName }: Props) {
  const { proposals, loading, setProposals } = useConsiderationPhase(fundingRoundId);
  const [reviewStates, setReviewStates] = useState<Record<number, ReviewState>>({});
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [newDecision, setNewDecision] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const handleVoteSuccess = useCallback((proposalId: number, newStatus: ProposalStatus) => {
    setProposals(prevProposals => 
      prevProposals.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, currentPhase: newStatus }
          : proposal
      )
    );
  }, [setProposals]);

  const { submitVote, isLoading: isVoting } = useConsiderationVote({ 
    fundingRoundId, 
    onVoteSuccess: handleVoteSuccess 
  });

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
        <div className="flex gap-2">
          <OCVVoteButton 
            proposalId={proposal.id.toString()} 
            useWallet={true} 
            voteStats={proposal.voteStats}
            fundingRoundMEFId={fundingRoundMEFId}
          />
          <OCVVoteButton 
            proposalId={proposal.id.toString()} 
            useWallet={false} 
            voteStats={proposal.voteStats}
            fundingRoundMEFId={fundingRoundMEFId}
          />
        </div>
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
        <div className="flex gap-2">
          <OCVVoteButton 
            proposalId={proposal.id.toString()} 
            useWallet={true} 
            voteStats={proposal.voteStats}
            fundingRoundMEFId={fundingRoundMEFId}
          />
          <OCVVoteButton 
            proposalId={proposal.id.toString()} 
            useWallet={false} 
            voteStats={proposal.voteStats}
            fundingRoundMEFId={fundingRoundMEFId}
          />
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => submitNewDecision(proposal.id, 'APPROVED')}
          disabled={isVoting}
        >
          ✅ Approve for Deliberation
        </Button>
        <Button
          variant="destructive"
          onClick={() => submitNewDecision(proposal.id, 'REJECTED')}
          disabled={isVoting}
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
      return null;
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

  // Group proposals by phase
  const groupedProposals = useMemo(() => {
    const considerationProposals = proposals.filter(p => p.currentPhase === 'CONSIDERATION');
    const deliberationProposals = proposals.filter(p => p.currentPhase === 'DELIBERATION');
    return { considerationProposals, deliberationProposals };
  }, [proposals]);

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
          {/* Consideration Phase Proposals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Consideration Phase</h2>
              <span className="text-muted-foreground">
                {groupedProposals.considerationProposals.length} proposals
              </span>
            </div>
            <div className="grid gap-4">
              {groupedProposals.considerationProposals.map((proposal) => (
                <Card key={proposal.id} className={cn(
                  "transition-all duration-200",
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
                        <div className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reviewer Votes */}
                            <VoteStatusCard
                              icon="👥"
                              title="Reviewer Votes"
                              eligibilityStatus={proposal.voteStats.reviewerEligible 
                                ? "Eligible" 
                                : `Need ${proposal.voteStats.requiredReviewerApprovals - proposal.voteStats.approved} more`}
                              isEligible={proposal.voteStats.reviewerEligible}
                              stats={
                                <VoteProgress
                                  approved={proposal.voteStats.approved}
                                  rejected={proposal.voteStats.rejected}
                                  total={proposal.voteStats.total}
                                />
                              }
                            >
                              <div />
                            </VoteStatusCard>

                            {/* Community Votes */}
                            <VoteStatusCard
                              icon="🌍"
                              title="Community Votes"
                              eligibilityStatus={proposal.voteStats.communityVotes.isEligible 
                                ? "Eligible" 
                                : "Not Eligible"}
                              isEligible={proposal.voteStats.communityVotes.isEligible}
                            >
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex items-center justify-between cursor-help">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-green-600 font-medium">
                                        {proposal.voteStats.communityVotes.positive} votes
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({proposal.voteStats.communityVotes.positiveStakeWeight} stake)
                                      </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                                      View Voters ↗
                                    </Button>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent 
                                  className="w-[340px]" 
                                  align="end"
                                  side="left"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-semibold">Community Voters</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {proposal.voteStats.communityVotes.voters.length} total
                                      </Badge>
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                      Note: OCV votes may take up to 10 minutes to appear here. Don&apos;t worry if your vote 
                                      doesn&apos;t show up immediately after voting.
                                    </div>
                                    
                                    {proposal.voteStats.communityVotes.voters.length > 0 ? (
                                      <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-2 -mr-2">
                                        {proposal.voteStats.communityVotes.voters.map((voter, i) => (
                                          <div 
                                            key={i} 
                                            className="flex items-center justify-between p-1.5 hover:bg-muted rounded-md transition-colors"
                                          >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0">
                                                {i + 1}
                                              </span>
                                              <VoterAddress address={voter.address} />
                                            </div>
                                            <div className="pl-2 flex-shrink-0">
                                              <FormattedTimestamp timestamp={voter.timestamp} />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground text-sm">
                                        No votes yet
                                      </div>
                                    )}
                                    
                                    <div className="pt-2 border-t">
                                      <p className="text-xs text-muted-foreground">
                                        Total Stake Weight: {proposal.voteStats.communityVotes.positiveStakeWeight}
                                      </p>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </VoteStatusCard>
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
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Motivation</h3>
                              <p className="text-muted-foreground">{proposal.motivation}</p>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Rationale</h3>
                              <p className="text-muted-foreground">{proposal.rationale}</p>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Delivery Requirements</h3>
                              <p className="text-muted-foreground">{proposal.deliveryRequirements}</p>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Security & Performance</h3>
                              <p className="text-muted-foreground">{proposal.securityAndPerformance}</p>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Budget Request</h3>
                              <p className="text-muted-foreground">
                                {proposal.budgetRequest.toLocaleString()} MINA
                              </p>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                              <div className="space-y-2">
                                {/* Show Discord info if author is a Discord user */}
                                {proposal.submitterMetadata?.authSource?.type === 'discord' ? (
                                  <p className="text-muted-foreground">
                                    Discord: {proposal.submitterMetadata.authSource.username}
                                  </p>
                                ) : (
                                  /* Check for linked Discord account */
                                  proposal.submitterMetadata?.linkedAccounts?.some(account => 
                                    account.authSource.type === 'discord'
                                  ) ? (
                                    <p className="text-muted-foreground">
                                      Discord: {proposal.submitterMetadata.linkedAccounts.find(account => 
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
                          </div>
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

          {/* Deliberation Phase Proposals */}
          {groupedProposals.deliberationProposals.length > 0 && (
            <div className="space-y-4 pt-8 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">Moving to Deliberation Phase</h2>
                  <p className="text-muted-foreground">
                    These proposals have reached the required approval threshold and are moving to deliberation.
                    Reviewers can still modify their consideration votes.
                  </p>
                </div>
                <span className="text-muted-foreground">
                  {groupedProposals.deliberationProposals.length} proposals
                </span>
              </div>
              <div className="grid gap-4">
                {groupedProposals.deliberationProposals.map((proposal) => (
                  <Card key={proposal.id} className={cn(
                    "transition-all duration-200 border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10",
                    "relative overflow-hidden"
                  )}>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        ✨ Moving to Deliberation
                      </Badge>
                    </div>
                    
                    <CardHeader className="pt-12">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{proposal.proposalName}</CardTitle>
                          <CardDescription>
                            👤 Submitted by {proposal.submitter}
                          </CardDescription>
                          <div className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Reviewer Votes */}
                              <VoteStatusCard
                                icon="👥"
                                title="Reviewer Votes"
                                eligibilityStatus={proposal.voteStats.reviewerEligible 
                                  ? "Eligible" 
                                  : `Need ${proposal.voteStats.requiredReviewerApprovals - proposal.voteStats.approved} more`}
                                isEligible={proposal.voteStats.reviewerEligible}
                                stats={
                                  <VoteProgress
                                    approved={proposal.voteStats.approved}
                                    rejected={proposal.voteStats.rejected}
                                    total={proposal.voteStats.total}
                                  />
                                }
                              >
                                <div />
                              </VoteStatusCard>

                              {/* Community Votes */}
                              <VoteStatusCard
                                icon="🌍"
                                title="Community Votes"
                                eligibilityStatus={proposal.voteStats.communityVotes.isEligible 
                                  ? "Eligible" 
                                  : "Not Eligible"}
                                isEligible={proposal.voteStats.communityVotes.isEligible}
                              >
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div className="flex items-center justify-between cursor-help">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-green-600 font-medium">
                                          {proposal.voteStats.communityVotes.positive} votes
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({proposal.voteStats.communityVotes.positiveStakeWeight} stake)
                                        </span>
                                      </div>
                                      <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                                        View Voters ↗
                                      </Button>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent 
                                    className="w-[340px]" 
                                    align="end"
                                    side="left"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Community Voters</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {proposal.voteStats.communityVotes.voters.length} total
                                        </Badge>
                                      </div>
                                      
                                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                        Note: OCV votes may take up to 10 minutes to appear here. Don&apos;t worry if your vote 
                                        doesn&apos;t show up immediately after voting.
                                      </div>
                                      
                                      {proposal.voteStats.communityVotes.voters.length > 0 ? (
                                        <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-2 -mr-2">
                                          {proposal.voteStats.communityVotes.voters.map((voter, i) => (
                                            <div 
                                              key={i} 
                                              className="flex items-center justify-between p-1.5 hover:bg-muted rounded-md transition-colors"
                                            >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0">
                                                  {i + 1}
                                                </span>
                                                <VoterAddress address={voter.address} />
                                              </div>
                                              <div className="pl-2 flex-shrink-0">
                                                <FormattedTimestamp timestamp={voter.timestamp} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                          No votes yet
                                        </div>
                                      )}
                                      
                                      <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                          Total Stake Weight: {proposal.voteStats.communityVotes.positiveStakeWeight}
                                        </p>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </VoteStatusCard>
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
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Motivation</h3>
                                <p className="text-muted-foreground">{proposal.motivation}</p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Rationale</h3>
                                <p className="text-muted-foreground">{proposal.rationale}</p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Delivery Requirements</h3>
                                <p className="text-muted-foreground">{proposal.deliveryRequirements}</p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Security & Performance</h3>
                                <p className="text-muted-foreground">{proposal.securityAndPerformance}</p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Budget Request</h3>
                                <p className="text-muted-foreground">
                                  {proposal.budgetRequest.toLocaleString()} MINA
                                </p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                                <div className="space-y-2">
                                  {/* Show Discord info if author is a Discord user */}
                                  {proposal.submitterMetadata?.authSource?.type === 'discord' ? (
                                    <p className="text-muted-foreground">
                                      Discord: {proposal.submitterMetadata.authSource.username}
                                    </p>
                                  ) : (
                                    /* Check for linked Discord account */
                                    proposal.submitterMetadata?.linkedAccounts?.some(account => 
                                      account.authSource.type === 'discord'
                                    ) ? (
                                      <p className="text-muted-foreground">
                                        Discord: {proposal.submitterMetadata.linkedAccounts.find(account => 
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
                            </div>
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
          )}
        </div>
      </div>
    </div>
  );
}