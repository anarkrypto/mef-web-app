import { PrismaClient, Prisma, ProposalStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import logger from "@/logging";

const prisma = new PrismaClient();

const VALID_PROPOSAL_STATUSES: ProposalStatus[] = [
  "DELIBERATION",
  "VOTING",
  "APPROVED",
  "REJECTED"
];

export class GptSurveyService {
  constructor(private db: PrismaClient = prisma) {}

  async getProposalsByFundingRound(roundId: string) {
    return this.db.proposal.findMany({
      where: {
        fundingRoundId: roundId,
        status: {
          in: VALID_PROPOSAL_STATUSES
        }
      },
      include: {
        user: {
          select: {
            metadata: true
          }
        },
        GptSurveySummarizerProposal: true,
        deliberationCommunityVotes: {
          include: {
            user: {
              select: {
                metadata: true
              }
            },
            GptSurveySummarizerFeedback: true
          }
        },
        fundingRound: {
          include: {
            deliberationPhase: true
          }
        }
      }
    });
  }

  async getFundingRound(roundId: string) {
    return this.db.fundingRound.findUnique({
      where: { id: roundId },
      include: {
        deliberationPhase: true
      }
    });
  }

  async getProposalSubmission(proposalId: number) {
    return this.db.gptSurveySummarizerProposal.findUnique({
      where: { proposalId }
    });
  }

  async getFeedbackSubmission(communityDeliberationVoteId: string) {
    return this.db.gptSurveySummarizerFeedback.findUnique({
      where: { communityDeliberationVoteId }
    });
  }

  async createProposalSubmission(data: {
    proposalId: number;
    request: Prisma.InputJsonValue;
    response: Prisma.InputJsonValue;
    isSuccess: boolean;
  }) {
    return this.db.gptSurveySummarizerProposal.create({
      data: {
        proposalId: data.proposalId,
        request: data.request,
        response: data.response,
        isSuccess: data.isSuccess
      }
    });
  }

  async createFeedbackSubmission({
    communityDeliberationVoteId,
    proposalId,
    request,
    response,
    isSuccess,
  }: {
    communityDeliberationVoteId: string;
    proposalId: string;
    request: string;
    response: string;
    isSuccess: boolean;
  }) {
    // First, ensure the proposal exists
    let gptProposal = await this.db.gptSurveySummarizerProposal.findFirst({
      where: { proposalId: parseInt(proposalId) }
    });

    // If proposal doesn't exist, create it
    if (!gptProposal) {
      gptProposal = await this.db.gptSurveySummarizerProposal.create({
        data: {
          proposalId: parseInt(proposalId),
          isSuccess: true,
          request: JSON.parse('{}'),
          response: JSON.parse('{}')
        }
      });
    }

    // Now create the feedback record
    return this.db.gptSurveySummarizerFeedback.create({
      data: {
        communityDeliberationVoteId,
        proposalId: gptProposal.id,
        request: JSON.parse(request),
        response: JSON.parse(response),
        isSuccess,
      },
    });
  }

  async updateProposalSummary(proposalId: number, summary: string) {
    return this.db.gptSurveySummarizerProposal.update({
      where: { proposalId },
      data: {
        summary,
        summary_updated_at: new Date()
      }
    });
  }

  async getProposalSummary(proposalId: number) {
    return this.db.gptSurveySummarizerProposal.findUnique({
      where: { proposalId },
      select: {
        summary: true,
        summary_updated_at: true
      }
    });
  }
} 

