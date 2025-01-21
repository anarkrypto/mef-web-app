import prisma from "@/lib/prisma";
import logger from "@/logging";
import { ApiResponse } from '@/lib/api-response';

/**
 * Funding round list for the header ("Phases Summaries")
 * @returns 
 */
export async function GET() {
  try {
    const fundingRounds = await prisma.fundingRound.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        endDate: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    return ApiResponse.success(fundingRounds);
  } catch (error) {
    logger.error('Failed to fetch funding rounds', { error });
    return ApiResponse.error('Failed to fetch funding rounds');
  }
} 