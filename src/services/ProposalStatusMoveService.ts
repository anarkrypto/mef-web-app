import { PrismaClient, ProposalStatus, ConsiderationDecision, Proposal } from "@prisma/client";
import { AppError } from "@/lib/errors";
import logger from "@/logging";
import { OCVVoteResponse } from './OCVApiService';
import { JsonValue } from 'type-fest';

function parseMinReviewerApprovals(): number {
  const DEFAULT_CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD = 2;
    const minApprovals = process.env.CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD;

    if (minApprovals !== undefined) {
        const parsed = parseInt(minApprovals, 10);
        if (isNaN(parsed) || parsed < 1) {
            logger.warn(`Invalid CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD value: ${minApprovals}, using default: ${DEFAULT_CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD}`);
            return DEFAULT_CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD;
        }
        return parsed;
    }
    return DEFAULT_CONSIDERATION_REVIEWER_APPROVAL_THRESHOLD;
}

class Constants {
    static Consideration = {
        minReviewerApprovals: parseMinReviewerApprovals()
    }
}

interface StatusMoveConfig {
  considerationPhase: {
    minReviewerApprovals: number;
  };
}

interface ProposalWithVotesBase {
  id: number;
  status: ProposalStatus;
  considerationVotes: {
    decision: ConsiderationDecision;
    voterId: string;
  }[];
  fundingRound: {
    topic: {
      reviewerGroups: {
        reviewerGroup: {
          members: Array<{ userId: string }>;
        };
      }[];
    };
  } | null;
}

interface ProposalWithVotes extends ProposalWithVotesBase {
  OCVConsiderationVote?: {
    id: number;
    proposalId: number;
    voteData: JsonValue;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

interface MoveResult {
  newStatus: ProposalStatus;
  ocvElegible: boolean;
  reviewerVotesGiven: number;
  reviewerVotesRequired: number;
}

export class ProposalStatusMoveService {
  private prisma: PrismaClient;
  private config: StatusMoveConfig;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.config = {
      considerationPhase: {
        minReviewerApprovals: Constants.Consideration.minReviewerApprovals
      }
    };
  }

  public get minReviewerApprovals(): number {
    return this.config.considerationPhase.minReviewerApprovals;
  }

  async checkAndMoveProposal(proposalId: number): Promise<MoveResult | null> {
    const proposal = await this.getProposalWithVotes(proposalId);
    
    if (!proposal) {
      throw new AppError("Proposal not found", 404);
    }

    // Only process proposals in CONSIDERATION or DELIBERATION status
    if (![ProposalStatus.CONSIDERATION.toString(), ProposalStatus.DELIBERATION.toString()].includes(proposal.status.toString())) {
      return null;
    }

    const shouldMove = proposal.status === ProposalStatus.CONSIDERATION
      ? await this.shouldMoveToDeliberation(proposal)
      : await this.shouldMoveBackToConsideration(proposal);


    if (shouldMove) {
      const newStatus = proposal.status === ProposalStatus.CONSIDERATION
        ? ProposalStatus.DELIBERATION
        : ProposalStatus.CONSIDERATION;

      await this.updateProposalStatus(proposalId, newStatus);

      const numReviewerApprovals = this.countValidApprovals(proposal);
      const ocvData = proposal.OCVConsiderationVote?.voteData as OCVVoteResponse | undefined;
      const isElegible = ocvData?.elegible ?? false;

      const thresholdReviewerApprovals = this.config.considerationPhase.minReviewerApprovals;
      
      return {
        newStatus,
        ocvElegible: isElegible,
        reviewerVotesGiven: numReviewerApprovals,
        reviewerVotesRequired: thresholdReviewerApprovals
      };
    }

    return null;
  }

  private async getProposalWithVotes(proposalId: number): Promise<ProposalWithVotes | null> {
    return this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        considerationVotes: {
          select: {
            decision: true,
            voterId: true
          }
        },
        OCVConsiderationVote: true,
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
  }

  private async shouldMoveToDeliberation(proposal: ProposalWithVotes): Promise<boolean> {
    const approvalCount = this.countValidApprovals(proposal);
    const isMinApprovals = approvalCount >= this.config.considerationPhase.minReviewerApprovals;
    const ocvData = proposal.OCVConsiderationVote?.voteData as OCVVoteResponse | undefined;
    const ocvElegible = ocvData?.elegible ?? false;

    logger.debug(`Proposal ${proposal.id} should move to DELIBERATION. Approval count: ${approvalCount}, min approvals: ${this.config.considerationPhase.minReviewerApprovals}, OCV elegible: ${ocvElegible}`);

    return isMinApprovals || ocvElegible;
  }

  private async shouldMoveBackToConsideration(proposal: ProposalWithVotes): Promise<boolean> {
    const approvalCount = this.countValidApprovals(proposal);
    const isMinApprovals = approvalCount >= this.config.considerationPhase.minReviewerApprovals;
    const ocvData = proposal.OCVConsiderationVote?.voteData as OCVVoteResponse | undefined; 
    const ocvElegible = ocvData?.elegible ?? false;
  
    logger.debug(`Proposal ${proposal.id} should move back to CONSIDERATION. Approval count: ${approvalCount}, min approvals: ${this.config.considerationPhase.minReviewerApprovals}, OCV elegible: ${ocvElegible}`);
 
    return !isMinApprovals && !ocvElegible;
  }

  private countValidApprovals(proposal: ProposalWithVotes): number {
    // Get list of valid reviewer IDs
    const reviewerIds = new Set<string>();
    proposal.fundingRound?.topic.reviewerGroups.forEach(trg => {
      trg.reviewerGroup.members.forEach(member => {
        reviewerIds.add(member.userId);
      });
    });

    // Count valid approvals
    return proposal.considerationVotes.filter(vote => 
      reviewerIds.has(vote.voterId) && 
      vote.decision === ConsiderationDecision.APPROVED
    ).length;
  }

  private async updateProposalStatus(proposalId: number, newStatus: ProposalStatus): Promise<void> {
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: newStatus }
    });
  }
}
