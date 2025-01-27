import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSubmissionPhase } from '@/hooks/use-submission-phase'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { CardFooter } from "@/components/ui/card"

interface Props {
  fundingRoundId: string;
  fundingRoundName: string;
}

interface ExpandedState {
  [key: number]: boolean;
}

export function SubmissionProposalList({ fundingRoundId, fundingRoundName }: Props) {
  const { proposals, loading, error } = useSubmissionPhase(fundingRoundId);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const toggleExpanded = (proposalId: number) => {
    setExpanded(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
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
            📝 Submission Phase: {fundingRoundName}
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              ({proposals.length} proposals submitted)
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/proposals/create">
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              ✨ Create A Proposal
            </Button>
          </Link>
          <Link href="/proposals">
            <Button variant="outline">
              📝 Submit a Proposal
            </Button>
          </Link>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No proposals have been submitted to this funding round yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{proposal.proposalName}</CardTitle>
                      <CardDescription>
                        👤 Submitted by {proposal.submitter}
                      </CardDescription>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>💰 Requested Budget:</span>
                          <Badge variant="outline" className="text-primary">
                            {proposal.budgetRequest.toLocaleString()} $MINA
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </Badge>
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
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
