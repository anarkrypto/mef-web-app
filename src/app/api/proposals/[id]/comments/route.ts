import { NextRequest } from "next/server";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import { ProposalService } from "@/services/ProposalService";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import logger from "@/logging";

const proposalService = new ProposalService(prisma);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return ApiResponse.unauthorized("Please log in to view comments");
    }

    const comments = await proposalService.getProposalComments(parseInt(awaitedParams.id));
    return ApiResponse.success(comments);
  } catch (error) {
    logger.error("Error fetching proposal comments:", error);
    return ApiResponse.error(error);
  }
} 