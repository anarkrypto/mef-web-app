import { PrismaClient, ProposalStatus, ConsiderationDecision, Proposal } from "@prisma/client";
import { AppError } from "@/lib/errors";
import logger from "@/logging";

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

interface ProposalWithVotes {
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

  async checkAndMoveProposal(proposalId: number): Promise<void> {
    const proposal = await this.getProposalWithVotes(proposalId);
    
    if (!proposal) {
      throw new AppError("Proposal not found", 404);
    }

    // Only process proposals in CONSIDERATION or DELIBERATION status
    if (proposal.status !== ProposalStatus.CONSIDERATION && 
        proposal.status !== ProposalStatus.DELIBERATION) {
      return;
    }

    const shouldMove = proposal.status === ProposalStatus.CONSIDERATION
      ? await this.shouldMoveToDeliberation(proposal)
      : await this.shouldMoveBackToConsideration(proposal);

    if (shouldMove) {
      const newStatus = proposal.status === ProposalStatus.CONSIDERATION
        ? ProposalStatus.DELIBERATION
        : ProposalStatus.CONSIDERATION;

      await this.updateProposalStatus(proposalId, newStatus);
      
      logger.info(`Proposal ${proposalId} moved from ${proposal.status} to ${newStatus}. ${this.countValidApprovals(proposal)} approvals.`);
    }
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
    return approvalCount >= this.config.considerationPhase.minReviewerApprovals;
  }

  private async shouldMoveBackToConsideration(proposal: ProposalWithVotes): Promise<boolean> {
    const approvalCount = this.countValidApprovals(proposal);
    return approvalCount < this.config.considerationPhase.minReviewerApprovals;
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
