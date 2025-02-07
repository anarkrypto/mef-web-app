import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api-response'
import { AppError } from '@/lib/errors'
import prisma from '@/lib/prisma'

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const awaitedId = (await context.params).id
  try {
    const fundingRound = await prisma.fundingRound.findUnique({
      where: { id: awaitedId },
      select: {
        totalBudget: true
      }
    })

    if (!fundingRound) {
      throw AppError.notFound('Funding round not found')
    }

    return ApiResponse.success({
      totalBudget: fundingRound.totalBudget.toNumber()
    })
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error)
    }
    return ApiResponse.error(AppError.badRequest('Failed to fetch funding round details'))
  }
} 