import { PrismaClient } from '@prisma/client';
import { OCVApiService } from './OCVApiService';
import { type VotingPhaseSummary } from '@/types/phase-summary';
import { UserMetadata } from '.';
import logger from '@/logging';

export class VotingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly ocvService: OCVApiService = new OCVApiService()
  ) {}

  async getVotingPhaseSummary(fundingRoundId: string): Promise<VotingPhaseSummary> {
    const fundingRound = await this.prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      include: {
        votingPhase: true,
        proposals: {
          include: {
            user: {
              select: {
                metadata: true
              }
            }
          },
          where: {
            status: {
              in: ['DELIBERATION', 'VOTING', 'APPROVED', 'REJECTED']
            }
          }, 
        },
      },
    });

    if (!fundingRound || !fundingRound.votingPhase) {
      throw new Error('Funding round or voting phase not found');
    }

    // Get ranked votes from OCV API
    const voteData = await this.ocvService.getRankedVotes(
      fundingRound.mefId,
    );

    // Calculate funding distribution
    const totalBudget = fundingRound.totalBudget.toNumber();
    let remainingBudget = totalBudget;
    const proposalVotes = [];
    let fundedProposals = 0;
    let notFundedProposals = 0;

    // Process proposals in ranked order
    for (const winnerId of voteData.winners) {
      const proposal = fundingRound.proposals.find(p => p.id == winnerId);
      if (!proposal) {
        logger.warn(`[VotingService] Proposal with id ${winnerId} not found`);
        continue;
      }

      const budgetRequest = proposal.budgetRequest.toNumber();
      const isFunded = budgetRequest <= remainingBudget;

      if (isFunded) {
        remainingBudget -= budgetRequest;
        fundedProposals++;
      } else {
        notFundedProposals++;
      }

      proposalVotes.push({
        id: proposal.id,
        proposalName: proposal.proposalName,
        proposer: this.getUserDisplayName(proposal.user.metadata as UserMetadata),
        status: proposal.status,
        budgetRequest: proposal.budgetRequest,
        isFunded,
        missingAmount: isFunded ? undefined : budgetRequest - remainingBudget
      });
    }

    // Calculate budget breakdown
    const budgetBreakdown = fundingRound.proposals.reduce(
      (acc, proposal) => {
        const budget = proposal.budgetRequest.toNumber();
        if (budget <= 500) acc.small++;
        else if (budget <= 1000) acc.medium++;
        else acc.large++;
        return acc;
      },
      { small: 0, medium: 0, large: 0 }
    );

    return {
      fundingRoundName: fundingRound.name,
      phaseTimeInfo: {
        startDate: fundingRound.votingPhase.startDate,
        endDate: fundingRound.votingPhase.endDate,
      },
      totalProposals: fundingRound.proposals.length,
      fundedProposals,
      notFundedProposals,
      totalBudget,
      remainingBudget,
      budgetBreakdown,
      proposalVotes,
    };
  }

  private getUserDisplayName(metadata: UserMetadata): string {
    try {
      if (typeof metadata === 'string') {
        const parsed = JSON.parse(metadata);
        return parsed.username || 'Anonymous';
      }
      if (metadata && typeof metadata === 'object') {
        return metadata.username || 'Anonymous';
      }
      return 'Anonymous';
    } catch (e) {
      return 'Anonymous';
    }
  }
} 