import { NextRequest } from "next/server";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import { DeliberationService } from "@/services/DeliberationService";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import logger from "@/logging";

const deliberationService = new DeliberationService(prisma);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return ApiResponse.unauthorized("Please log in to view proposals");
    }

    const proposals = await deliberationService.getDeliberationProposals(
      (await params).id,
      user.id
    );

    return ApiResponse.success(proposals);
  } catch (error) {
    logger.error("Error fetching deliberation proposals:", error);
    return ApiResponse.error(error);
  }
} 