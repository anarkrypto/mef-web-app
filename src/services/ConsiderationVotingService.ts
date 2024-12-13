// src/services/ConsiderationVotingService.ts

import { PrismaClient, ConsiderationDecision, ProposalStatus, ConsiderationVote, Prisma } from "@prisma/client";
import { ProposalStatusMoveService } from "./ProposalStatusMoveService";
import { FundingRoundService } from "./FundingRoundService";
import logger from "@/logging";
import { UserMetadata } from "@/services";

interface VoteInput {
  proposalId: number;
  voterId: string;
  decision: ConsiderationDecision;
  feedback: string;
}

interface VoteEligibility {
  eligible: boolean;
  message?: string;
}

interface VoteQueryResult {
  proposal: {
    id: number;
    status: ProposalStatus;
    proposalName: string;
    abstract: string;
    createdAt: Date;
    user: {
      metadata: UserMetadata;
    };
    considerationVotes: ConsiderationVote[];
  };
  voter: {
    metadata: UserMetadata;
  };
}

const voteIncludeQuery = {
  proposal: {
    select: {
      id: true,
      status: true,
      proposalName: true,
      abstract: true,
      createdAt: true,
      user: {
        select: {
          metadata: true
        }
      },
      considerationVotes: true
    }
  },
  voter: {
    select: {
      metadata: true
    }
  }
} satisfies Prisma.ConsiderationVoteInclude;

export class ConsiderationVotingService {
  private statusMoveService: ProposalStatusMoveService;
  private fundingRoundService: FundingRoundService;

  constructor(private prisma: PrismaClient) {
    this.statusMoveService = new ProposalStatusMoveService(prisma);
    this.fundingRoundService = new FundingRoundService(prisma);
  }

  async submitVote(input: VoteInput): Promise<VoteQueryResult> {
    const existingVote = await this.getVoteWithDetails(input.proposalId, input.voterId);
    
    // Create or update vote
    const vote = await this.createOrUpdateVote(input, existingVote);
    
    // Check if status should change and refresh data
    await this.statusMoveService.checkAndMoveProposal(input.proposalId);
    
    // Get fresh data after potential status change
    return this.refreshVoteData(input.proposalId, input.voterId);
  }

  async checkVotingEligibility(
    proposalId: number, 
    fundingRoundId: string
  ): Promise<VoteEligibility> {
    const fundingRound = await this.fundingRoundService.getFundingRoundById(fundingRoundId);
    
    if (!fundingRound) {
      return { eligible: false, message: "Funding round not found" };
    }

    // Ensure all required phases exist and have proper dates
    if (!fundingRound.submissionPhase?.startDate || 
        !fundingRound.submissionPhase?.endDate ||
        !fundingRound.considerationPhase?.startDate || 
        !fundingRound.considerationPhase?.endDate ||
        !fundingRound.deliberationPhase?.startDate || 
        !fundingRound.deliberationPhase?.endDate ||
        !fundingRound.votingPhase?.startDate || 
        !fundingRound.votingPhase?.endDate) {
      return { 
        eligible: false, 
        message: "Funding round is not properly configured" 
      };
    }

    // Now we can safely pass the funding round with its phases
    const currentPhase = this.fundingRoundService.getCurrentPhase({
      ...fundingRound,
      submissionPhase: {
        startDate: fundingRound.submissionPhase.startDate,
        endDate: fundingRound.submissionPhase.endDate
      },
      considerationPhase: {
        startDate: fundingRound.considerationPhase.startDate,
        endDate: fundingRound.considerationPhase.endDate
      },
      deliberationPhase: {
        startDate: fundingRound.deliberationPhase.startDate,
        endDate: fundingRound.deliberationPhase.endDate
      },
      votingPhase: {
        startDate: fundingRound.votingPhase.startDate,
        endDate: fundingRound.votingPhase.endDate
      }
    });

    // Check current phase
    if (currentPhase.toUpperCase() !== ProposalStatus.CONSIDERATION) {
      return { 
        eligible: false, 
        message: "Voting is only allowed during the consideration phase" 
      };
    }

    // Get proposal status
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      return { eligible: false, message: "Proposal not found" };
    }

    // Allow voting if proposal is in CONSIDERATION or DELIBERATION status
    if (proposal.status.toUpperCase() !== ProposalStatus.CONSIDERATION && 
        proposal.status.toUpperCase() !== ProposalStatus.DELIBERATION) {
      return { 
        eligible: false, 
        message: "Proposal is not eligible for consideration votes" 
      };
    }

    return { eligible: true };
  }

  async checkReviewerEligibility(userId: string, proposalId: number): Promise<boolean> {
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
                        members: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!proposal?.fundingRound?.topic?.reviewerGroups) {
      return false;
    }

    return proposal.fundingRound.topic.reviewerGroups.some(trg =>
      trg.reviewerGroup.members.some(member => 
        member.userId === userId
      )
    );
  }

  private async getVoteWithDetails(
    proposalId: number, 
    voterId: string
  ): Promise<VoteQueryResult | null> {
    const vote = await this.prisma.considerationVote.findUnique({
      where: {
        proposalId_voterId: { proposalId, voterId }
      },
      include: voteIncludeQuery
    });

    if (!vote) return null;

    return {
      ...vote,
      proposal: {
        ...vote.proposal,
        user: {
          metadata: vote.proposal.user.metadata as Prisma.JsonValue as UserMetadata
        }
      },
      voter: {
        metadata: vote.voter.metadata as Prisma.JsonValue as UserMetadata
      }
    };
  }

  private async createOrUpdateVote(
    input: VoteInput,
    existingVote: VoteQueryResult | null
  ): Promise<VoteQueryResult> {
    let returnValue;

    if (existingVote) {
      returnValue = await this.prisma.considerationVote.update({
        where: {
          proposalId_voterId: {
            proposalId: input.proposalId,
            voterId: input.voterId
          }
        },
        data: {
          decision: input.decision,
          feedback: input.feedback,
        },
        include: voteIncludeQuery
      });
    } else {
      returnValue = await this.prisma.considerationVote.create({
        data: {
          proposalId: input.proposalId,
          voterId: input.voterId,
          decision: input.decision,
          feedback: input.feedback,
        },
        include: voteIncludeQuery
      });
    }

    return {
      ...returnValue,
      proposal: {
        ...returnValue.proposal,
        user: {
          metadata: returnValue.proposal.user.metadata as Prisma.JsonValue as UserMetadata
        }
      },
      voter: {
        metadata: returnValue.voter.metadata as Prisma.JsonValue as UserMetadata
      }
    };
  }

  private async refreshVoteData(
    proposalId: number, 
    voterId: string
  ): Promise<VoteQueryResult> {
    const vote = await this.prisma.considerationVote.findUniqueOrThrow({
      where: {
        proposalId_voterId: { proposalId, voterId }
      },
      include: voteIncludeQuery
    });

    logger.info(
      `Vote refreshed for proposal ${proposalId}. Current status: ${vote.proposal.status}`
    );

    return {
      ...vote,
      proposal: {
        ...vote.proposal,
        user: {
          metadata: vote.proposal.user.metadata as UserMetadata
        }
      },
      voter: {
        metadata: vote.voter.metadata as UserMetadata
      }
    };
  }
}