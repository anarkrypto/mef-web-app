import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import type { UserMetadata } from '@/services/UserService';
import type { JsonValue } from '@prisma/client/runtime/library';
import logger from "@/logging";
import { OCVVotesService } from "@/services/OCVVotesService";
import { ProposalStatusMoveService } from "@/services/ProposalStatusMoveService";
import type { OCVVoteData, OCVVote } from '@/types/consideration';
import { UserService } from "@/services";

// Add this helper function to safely parse OCV vote data
function parseOCVVoteData(data: JsonValue | null | undefined): OCVVoteData {
  const defaultData: OCVVoteData = {
    total_community_votes: 0,
    total_positive_community_votes: 0,
    positive_stake_weight: "0",
    elegible: false,
    votes: []
  };

  if (!data || typeof data !== 'object') {
    return defaultData;
  }

  // Type assertion after runtime check
  const voteData = data as Record<string, unknown>;
  
  return {
    total_community_votes: typeof voteData.total_community_votes === 'number' ? voteData.total_community_votes : 0,
    total_positive_community_votes: typeof voteData.total_positive_community_votes === 'number' ? voteData.total_positive_community_votes : 0,
    positive_stake_weight: typeof voteData.positive_stake_weight === 'string' ? voteData.positive_stake_weight : "0",
    elegible: Boolean(voteData.elegible),
    votes: Array.isArray(voteData.votes) ? voteData.votes.map(vote => ({
      account: String(vote.account || ''),
      timestamp: Number(vote.timestamp || 0),
      hash: String(vote.hash || '')
    })) : []
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fundingRoundId = (await params).id;
    const userService = new UserService(prisma);

    // Get the funding round with topic and reviewer groups
    const fundingRound = await prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      include: {
        topic: {
          include: {
            reviewerGroups: {
              include: {
                reviewerGroup: {
                  include: {
                    members: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!fundingRound) {
      return NextResponse.json({ error: "Funding round not found" }, { status: 404 });
    }

    // Check if user is a reviewer
    const isReviewer = fundingRound.topic.reviewerGroups.some(trg => 
      trg.reviewerGroup.members.some(m => 
        m.userId === user.id || m.userId === user.linkId
      )
    );

    // Get both consideration and deliberation proposals for this funding round
    const proposals = await prisma.proposal.findMany({
      where: {
        fundingRoundId,
        status: {
          in: ['CONSIDERATION', 'DELIBERATION']
        },
      },
      include: {
        user: {
          select: {
            id: true,
            metadata: true
          }
        },
        considerationVotes: {
          where: {
            voterId: user.id
          },
          select: {
            decision: true,
            feedback: true
          }
        },
        OCVConsiderationVote: true,
        _count: {
          select: {
            considerationVotes: true
          }
        }
      }
    });

    const statusMoveService = new ProposalStatusMoveService(prisma);
    const minReviewerApprovals = statusMoveService.minReviewerApprovals;

    // Get vote counts for each proposal
    const proposalVoteCounts = await Promise.all(
      proposals.map(async (proposal) => {
        const [reviewerVotes, ocvVotes] = await Promise.all([
          prisma.considerationVote.groupBy({
            by: ['decision'],
            where: {
              proposalId: proposal.id
            },
            _count: true
          }),
          parseOCVVoteData(proposal.OCVConsiderationVote?.voteData)
        ]);

        const approved = reviewerVotes.find(v => v.decision === 'APPROVED')?._count || 0;
        const rejected = reviewerVotes.find(v => v.decision === 'REJECTED')?._count || 0;

        return {
          proposalId: proposal.id,
          voteStats: {
            approved,
            rejected,
            total: approved + rejected,
            communityVotes: {
              total: ocvVotes.total_community_votes || 0,
              positive: ocvVotes.total_positive_community_votes || 0,
              positiveStakeWeight: ocvVotes.positive_stake_weight || "0",
              isEligible: ocvVotes.elegible || false,
              voters: ocvVotes.votes?.map((v: OCVVote) => ({
                address: v.account,
                timestamp: v.timestamp,
                hash: v.hash
              })) || []
            },
            reviewerEligible: approved >= minReviewerApprovals,
            requiredReviewerApprovals: minReviewerApprovals
          }
        };
      })
    );

    // Transform the data to match the expected format
    const formattedProposals = await Promise.all(proposals.map(async p => {
      const voteCounts = proposalVoteCounts.find(vc => vc.proposalId === p.id)?.voteStats;
      const linkedAccounts = await userService.getLinkedAccounts(p.user.id);
      const linkedAccountsMetadata = linkedAccounts.map(account => ({
        id: account.id,
        authSource: (account.metadata as UserMetadata)?.authSource || {
          type: '',
          id: '',
          username: ''
        }
      }));
      
      return {
        id: p.id,
        proposalName: p.proposalName,
        submitter: ((p.user.metadata as unknown) as UserMetadata).username,
        abstract: p.abstract,
        status: p.considerationVotes[0]?.decision?.toLowerCase() || 'pending',
        motivation: p.motivation,
        rationale: p.rationale,
        deliveryRequirements: p.deliveryRequirements,
        securityAndPerformance: p.securityAndPerformance,
        budgetRequest: p.budgetRequest,
        userVote: p.considerationVotes[0] ? {
          decision: p.considerationVotes[0].decision,
          feedback: p.considerationVotes[0].feedback
        } : undefined,
        createdAt: p.createdAt,
        isReviewerEligible: isReviewer,
        voteStats: voteCounts || {
          approved: 0,
          rejected: 0,
          total: 0,
          communityVotes: {
            total: 0,
            positive: 0,
            positiveStakeWeight: "0",
            isEligible: false
          },
          reviewerEligible: false
        },
        currentPhase: p.status,
        email: p.email || '',
        submitterMetadata: {
          authSource: {
            type: ((p.user.metadata as unknown) as UserMetadata)?.authSource?.type || '',
            id: ((p.user.metadata as unknown) as UserMetadata)?.authSource?.id || '',
            username: ((p.user.metadata as unknown) as UserMetadata)?.authSource?.username || ''
          },
          linkedAccounts: linkedAccountsMetadata
        }
      };
    }));

    // Sort proposals: 
    // 1. Consideration phase pending first
    // 2. Consideration phase voted
    // 3. Deliberation phase
    const sortedProposals = formattedProposals.sort((a, b) => {
      if (a.currentPhase === 'CONSIDERATION' && b.currentPhase === 'DELIBERATION') return -1;
      if (a.currentPhase === 'DELIBERATION' && b.currentPhase === 'CONSIDERATION') return 1;
      if (a.currentPhase === b.currentPhase) {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
      }
      return 0;
    });

    return NextResponse.json(sortedProposals);
  } catch (error) {
    logger.error("Failed to fetch consideration proposals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 