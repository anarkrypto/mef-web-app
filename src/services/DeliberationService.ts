import { PrismaClient, Prisma, ProposalStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { UserMetadata } from "./UserService";
import { Decimal } from "@prisma/client/runtime/library";

// Define types for the votes
interface ReviewerDeliberationVote {
  id: string;
  feedback: string;
  recommendation: boolean;
  createdAt: Date;
  userId: string;
  user: {
    metadata: UserMetadata;
  };
}

interface CommunityDeliberationVote {
  id: string;
  feedback: string;
  createdAt: Date;
  userId: string;
  user: {
    metadata: UserMetadata;
  };
}

// Define the proposal type with included relations
interface ProposalWithVotes {
  id: number;
  status: ProposalStatus;
  proposalName: string;
  abstract: string;
  createdAt: Date;
  user: {
    metadata: UserMetadata;
  };
  deliberationReviewerVotes: ReviewerDeliberationVote[];
  deliberationCommunityVotes: CommunityDeliberationVote[];
  fundingRound: {
    topic: {
      reviewerGroups: {
        reviewerGroup: {
          members: Array<{ userId: string }>;
        };
      }[];
    };
  };
}

interface DeliberationPhaseSummary {
  startDate: Date;
  endDate: Date;
  totalProposals: number;
  recommendedProposals: number;
  notRecommendedProposals: number;
  budgetBreakdown: {
    small: number;  // 100-500 MINA
    medium: number; // 500-1000 MINA
    large: number;  // 1000+ MINA
  };
  proposalVotes: Array<{
    id: number;
    proposalName: string;
    proposer: string;
    yesVotes: number;
    noVotes: number;
    status: ProposalStatus;
    isRecommended: boolean;
    budgetRequest: Decimal;
  }>;
}

export class DeliberationService {
  constructor(private prisma: PrismaClient) {}

  async getDeliberationProposals(fundingRoundId: string, userId: string) {
    if (!fundingRoundId) {
      throw new AppError("Funding round ID is required", 400);
    }

    const fundingRound = await this.prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      include: {
        deliberationPhase: true,
        topic: {
          include: {
            reviewerGroups: {
              include: {
                reviewerGroup: {
                  include: {
                    members: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!fundingRound) {
      throw new AppError("Funding round not found", 404);
    }

    // Get all proposals in deliberation phase for this funding round
    const proposals = await this.prisma.proposal.findMany({
      where: {
        fundingRoundId,
        status: 'DELIBERATION' as ProposalStatus,
      },
      include: {
        deliberationReviewerVotes: {
          include: {
            user: {
              select: {
                metadata: true,
              },
            },
          },
        },
        deliberationCommunityVotes: {
          include: {
            user: {
              select: {
                metadata: true,
              },
            },
          },
        },
        user: {
          select: {
            metadata: true,
          },
        },
        fundingRound: {
          include: {
            topic: {
              include: {
                reviewerGroups: {
                  include: {
                    reviewerGroup: {
                      include: {
                        members: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }) as unknown as ProposalWithVotes[];

    // Transform the proposals
    const transformedProposals = proposals.map(proposal => {
      // Get reviewer comments
      const reviewerComments = proposal.deliberationReviewerVotes.map(vote => ({
        id: vote.id,
        feedback: vote.feedback,
        recommendation: vote.recommendation,
        createdAt: vote.createdAt,
        reviewer: {
          username: (vote.user?.metadata as UserMetadata)?.username || 'Unknown',
        },
        isReviewerComment: true,
      }));

      // Get community comments
      const communityComments = proposal.deliberationCommunityVotes.map(vote => ({
        id: vote.id,
        feedback: vote.feedback,
        createdAt: vote.createdAt,
        isReviewerComment: false,
      }));

      // Combine and sort all comments
      const allComments = [...reviewerComments, ...communityComments].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Find user's own deliberation
      const userReviewerVote = proposal.deliberationReviewerVotes.find(
        vote => vote.userId === userId
      );
      const userCommunityVote = proposal.deliberationCommunityVotes.find(
        vote => vote.userId === userId
      );
      const userDeliberation = userReviewerVote || userCommunityVote;

      return {
        id: proposal.id,
        proposalName: proposal.proposalName,
        abstract: proposal.abstract,
        submitter: (proposal.user?.metadata as UserMetadata)?.username || 'Unknown',
        isReviewerEligible: fundingRound.topic.reviewerGroups.some(
          group => group.reviewerGroup.members.length > 0
        ),
        reviewerComments: allComments,
        userDeliberation: userDeliberation ? {
          feedback: userDeliberation.feedback,
          recommendation: 'recommendation' in userDeliberation ? userDeliberation.recommendation : undefined,
          createdAt: userDeliberation.createdAt,
          isReviewerVote: 'recommendation' in userDeliberation
        } : undefined,
        hasVoted: Boolean(userDeliberation),
        createdAt: proposal.createdAt,
      };
    });

    return {
      proposals: transformedProposals,
      pendingCount: transformedProposals.filter(p => !p.hasVoted).length,
      totalCount: transformedProposals.length,
    };
  }

  async submitDeliberation(
    proposalId: number,
    userId: string,
    feedback: string,
    recommendation?: boolean
  ) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        fundingRound: {
          include: {
            topic: {
              include: {
                reviewerGroups: {
                  include: {
                    reviewerGroup: {
                      include: {
                        members: {
                          where: { userId },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new AppError("Proposal not found", 404);
    }

    if (proposal.status !== 'DELIBERATION') {
      throw new AppError("Proposal is not in deliberation phase", 400);
    }

    // Check if user is a reviewer
    const isReviewer = proposal.fundingRound?.topic.reviewerGroups.some(
      group => group.reviewerGroup.members.length > 0
    ) ?? false;

    if (recommendation !== undefined && !isReviewer) {
      throw new AppError("Only reviewers can submit recommendations", 403);
    }

    // Create or update the appropriate vote type
    if (isReviewer) {
      if (recommendation === undefined) {
        throw new AppError("Reviewers must provide a recommendation", 400);
      }

      return await this.prisma.reviewerDeliberationVote.upsert({
        where: {
          proposalId_userId: {
            proposalId,
            userId,
          },
        },
        create: {
          proposalId,
          userId,
          feedback,
          recommendation,
        },
        update: {
          feedback,
          recommendation,
        },
      });
    } else {
      return await this.prisma.communityDeliberationVote.upsert({
        where: {
          proposalId_userId: {
            proposalId,
            userId,
          },
        },
        create: {
          proposalId,
          userId,
          feedback,
        },
        update: {
          feedback,
        },
      });
    }
  }

  async getDeliberationPhaseSummary(fundingRoundId: string): Promise<DeliberationPhaseSummary> {
    const fundingRound = await this.prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      include: {
        deliberationPhase: true,
        proposals: {
          where: {
            status: {
              in: ['DELIBERATION', 'VOTING', 'APPROVED', 'REJECTED']
            }
          },
          include: {
            user: {
              select: {
                metadata: true
              }
            },
            deliberationReviewerVotes: true
          }
        }
      }
    });

    if (!fundingRound || !fundingRound.deliberationPhase) {
      throw new AppError("Funding round or deliberation phase not found", 404);
    }

    const { proposals, deliberationPhase } = fundingRound;

    // Calculate budget breakdowns
    const budgetBreakdown = {
      small: 0,
      medium: 0,
      large: 0
    };

    proposals.forEach(proposal => {
      const budget = proposal.budgetRequest as unknown as Decimal;
      const budgetNumber = budget.toNumber();
      
      if (budgetNumber <= 500) {
        budgetBreakdown.small++;
      } else if (budgetNumber <= 1000) {
        budgetBreakdown.medium++;
      } else {
        budgetBreakdown.large++;
      }
    });

    // Calculate votes for each proposal
    const proposalVotes = proposals.map(proposal => {
      const votes = proposal.deliberationReviewerVotes;
      const yesVotes = votes.filter(v => v.recommendation).length;
      const noVotes = votes.filter(v => !v.recommendation).length;
      
      return {
        id: proposal.id,
        proposalName: proposal.proposalName,
        proposer: (proposal.user.metadata as UserMetadata).username || 'Unknown',
        yesVotes,
        noVotes,
        status: proposal.status,
        isRecommended: yesVotes > noVotes,
        budgetRequest: proposal.budgetRequest,
      };
    });

    // Count recommended and not recommended proposals based on reviewer votes
    const recommendedProposals = proposalVotes.filter(p => p.isRecommended).length;
    const notRecommendedProposals = proposalVotes.filter(p => !p.isRecommended).length;

    // Sort proposals by yes votes in descending order
    proposalVotes.sort((a, b) => b.yesVotes - a.yesVotes);

    return {
      startDate: deliberationPhase.startDate,
      endDate: deliberationPhase.endDate,
      totalProposals: proposals.length,
      recommendedProposals,
      notRecommendedProposals,
      budgetBreakdown,
      proposalVotes
    };
  }
} 