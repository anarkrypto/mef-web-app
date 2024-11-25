'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useConsiderationPhase } from '@/hooks/use-consideration-phase'
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'

interface Props {
  fundingRoundId: string;
  fundingRoundName: string;
}

type ReviewState = 'initial' | 'decided' | 'editing';

interface ExpandedState {
  [key: number]: boolean;
}

export function ConsiderationProposalList({ fundingRoundId, fundingRoundName }: Props) {
  const { proposals, loading, setProposals } = useConsiderationPhase(fundingRoundId);
  const [reviewStates, setReviewStates] = useState<Record<number, ReviewState>>({});
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [newDecision, setNewDecision] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const toggleExpanded = (proposalId: number) => {
    setExpanded(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }));
  };

  const handleDecision = (proposalId: number, decision: 'approved' | 'rejected') => {
    if (!decisions[proposalId]?.trim()) {
      alert('Please provide feedback before making a decision');
      return;
    }

    setProposals(prev => 
      prev.map(p => 
        p.id === proposalId 
          ? { ...p, status: decision } 
          : p
      )
    );
    setReviewStates(prev => ({ ...prev, [proposalId]: 'decided' }));
  };

  const startEdit = (proposalId: number) => {
    setNewDecision(prev => ({
      ...prev,
      [proposalId]: '' // Start with empty new decision
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

  const submitNewDecision = (proposalId: number, status: 'approved' | 'rejected') => {
    if (!newDecision[proposalId]?.trim()) {
      alert('Please provide feedback before submitting');
      return;
    }

    setDecisions(prev => ({
      ...prev,
      [proposalId]: newDecision[proposalId]
    }));
    setProposals(prev => 
      prev.map(p => 
        p.id === proposalId 
          ? { ...p, status } 
          : p
      )
    );
    setReviewStates(prev => ({ ...prev, [proposalId]: 'decided' }));
    setNewDecision(prev => ({
      ...prev,
      [proposalId]: ''
    }));
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
              ({proposals.length} proposals, {proposals.filter(p => p.status === 'pending').length} pending review)
            </span>
          </h1>
        </div>

        <div className="space-y-6">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{proposal.proposalName}</CardTitle>
                    <CardDescription>
                      👤 Submitted by {proposal.submitter}
                    </CardDescription>
                  </div>
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

                {reviewStates[proposal.id] === 'editing' ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">📝 Previous Decision:</h4>
                      <p className="text-muted-foreground">{decisions[proposal.id]}</p>
                    </div>
                    <Textarea
                      placeholder="Enter your new decision..."
                      value={newDecision[proposal.id] || ''}
                      onChange={(e) => setNewDecision(prev => ({
                        ...prev,
                        [proposal.id]: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                  </div>
                ) : reviewStates[proposal.id] === 'decided' ? (
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">📋 Decision:</h4>
                    <p className="text-muted-foreground">{decisions[proposal.id]}</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2">✍️ Your Feedback:</h4>
                    <Textarea
                      placeholder="Enter your feedback..."
                      value={decisions[proposal.id] || ''}
                      onChange={(e) => setDecisions(prev => ({
                        ...prev,
                        [proposal.id]: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
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
                      <Button
                        variant={proposal.status === 'approved' ? 'destructive' : 'default'}
                        onClick={() => submitNewDecision(proposal.id, proposal.status === 'approved' ? 'rejected' : 'approved')}
                      >
                        {proposal.status === 'approved' ? '❌ Reject' : '✅ Approve'} for Deliberation
                      </Button>
                    </>
                  ) : reviewStates[proposal.id] === 'decided' ? (
                    <>
                      <Button
                        variant="ghost"
                        className="underline"
                        onClick={() => startEdit(proposal.id)}
                      >
                        ✏️ Edit Decision
                      </Button>
                      <Badge variant={proposal.status === 'approved' ? 'default' : 'destructive'}>
                        {proposal.status === 'approved' ? '✅ Approved' : '❌ Rejected'} for Deliberation
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleDecision(proposal.id, 'approved')}
                      >
                        ✅ Approve for Deliberation
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecision(proposal.id, 'rejected')}
                      >
                        ❌ Reject for Deliberation
                      </Button>
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