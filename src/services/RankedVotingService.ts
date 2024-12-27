import { PrismaClient, ProposalStatus } from "@prisma/client";
import { UserMetadata } from "@/services/UserService";

export interface RankedProposalAPIResponse {
  id: number;
  proposalName: string;
  reviewerVoteCount: number;
  status: ProposalStatus;
  budgetRequest: number;
  author: {
    username: string;
    authType: "discord" | "wallet";
    id: string;
  };
  reviewerVotes: {
    approved: number;
    rejected: number;
    total: number;
  };
  communityVotes: {
    positiveStakeWeight: string;
    totalVotes: number;
  };
}

export interface GetRankedEligibleProposalsAPIResponse {
  proposals: RankedProposalAPIResponse[];
  fundingRound: _FundingRound;
}

export interface _FundingRound {
  id: number;
  name: string;
}

export class RankedVotingService {
  constructor(private prisma: PrismaClient) {}

  static Formatter = {
    formatRankedVoteMemoConsideration: (proposalIds: number[]): string => {
      return `YES ${proposalIds.join(' ')}`;
    },

    formatRankedVoteMemoVoting: (fundingRoundId: number, proposalIds: number[]): string => {
      // the format is MEF <round number> <project_id1> ... <project_idn>
      return `MEF ${fundingRoundId} ${proposalIds.join(' ')}`;
    }
  }

  async getEligibleProposals(fundingRoundId: string): Promise<GetRankedEligibleProposalsAPIResponse> {
    const result = await this.prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      select: {
        name: true,
        proposals: {
          where: { status: 'DELIBERATION' },
          select: {
            id: true,
            proposalName: true,
            status: true,
            budgetRequest: true,
            user: {
              select: {
                metadata: true,
                linkId: true,
              }
            },
            deliberationReviewerVotes: {
              select: {
                id: true,
                recommendation: true
              }
            },
            OCVConsiderationVote: {
              select: {
                voteData: true
              }
            }
          },
          orderBy: {
            deliberationReviewerVotes: {
              _count: 'desc'
            }
          }
        }
      }
    });

    if (!result) {
      throw new Error('Funding round not found');
    }

    const proposals = result.proposals.map(p => {
      const metadata = p.user.metadata as UserMetadata;
      const authType = p.user.linkId ? ("discord" as const) : ("wallet" as const);
      const approvedVotes = p.deliberationReviewerVotes.filter(v => v.recommendation).length;
      const rejectedVotes = p.deliberationReviewerVotes.filter(v => !v.recommendation).length;
      const ocvData = p.OCVConsiderationVote?.voteData as any || {};

      return {
        id: p.id,
        proposalName: p.proposalName,
        reviewerVoteCount: p.deliberationReviewerVotes.length,
        status: p.status,
        budgetRequest: p.budgetRequest.toNumber(),
        author: {
          username: metadata.username,
          authType,
          id: authType === "wallet" ? metadata.username : metadata.authSource?.id || ""
        },
        reviewerVotes: {
          approved: approvedVotes,
          rejected: rejectedVotes,
          total: approvedVotes + rejectedVotes
        },
        communityVotes: {
          positiveStakeWeight: ocvData.positive_stake_weight || "0",
          totalVotes: ocvData.total_community_votes || 0
        }
      } satisfies RankedProposalAPIResponse;
    });

    return {
      proposals,
      fundingRound: {
        id: fundingRoundId,
        name: result.name
      }
    };
  }

} 