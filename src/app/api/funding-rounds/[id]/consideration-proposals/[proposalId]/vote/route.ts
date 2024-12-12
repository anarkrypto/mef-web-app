import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import { ConsiderationVotingService } from "@/services/ConsiderationVotingService";
import { ApiResponse } from "@/lib/api-response";
import { AuthErrors } from "@/constants/errors";
import logger from "@/logging";
import { AppError } from "@/lib/errors";

const voteSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().min(1).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return ApiResponse.unauthorized(AuthErrors.UNAUTHORIZED);
    }

    const fundingRoundId = (await params).id;
    const proposalId = parseInt((await params).proposalId);
    
    const votingService = new ConsiderationVotingService(prisma);
    
    // Check reviewer eligibility
    const isReviewer = await votingService.checkReviewerEligibility(user.id, proposalId);
    if (!isReviewer) {
      return ApiResponse.unauthorized("Not authorized to vote on this proposal");
    }

    // Check if voting is allowed in current phase and for this proposal
    const { eligible, message } = await votingService.checkVotingEligibility(proposalId, fundingRoundId);
    if (!eligible) {
      return ApiResponse.error(new AppError(message!, 403));
    }

    // Validate and submit vote
    const validatedData = voteSchema.parse(await request.json());
    const vote = await votingService.submitVote({
      proposalId,
      voterId: user.id,
      decision: validatedData.decision,
      feedback: validatedData.feedback,
    });

    return ApiResponse.success(vote);
  } catch (error) {
    logger.error("Failed to submit vote:", error);
    if (error instanceof z.ZodError) {
      return ApiResponse.error(error);
    }
    return ApiResponse.error(error);
  }
} 