import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { AdminService } from "@/services/AdminService";

const adminService = new AdminService(prisma);

const ALLOW_MULTIPLE_ACTIVE_ROUNDS: boolean = true;

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

type FundingRoundStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const validTransitions: Record<FundingRoundStatus, FundingRoundStatus[]> = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

async function validateStatusTransition(
  currentStatus: FundingRoundStatus,
  newStatus: FundingRoundStatus,
  roundId: string
) {
  // Check if transition is allowed
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  // Additional validation for ACTIVE status
  if (newStatus === 'ACTIVE') {
    // Check if round has all required phases
    const round = await prisma.fundingRound.findUnique({
      where: { id: roundId },
      include: {
        submissionPhase: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
      },
    });

    if (!round || !round.submissionPhase || !round.considerationPhase || !round.deliberationPhase || !round.votingPhase) {
      return {
        valid: false,
        error: "Funding round must have all phases defined before activation",
      };
    }
    
    if (!ALLOW_MULTIPLE_ACTIVE_ROUNDS) {
    // Check if there's already an active round
      if (currentStatus !== 'ACTIVE') {
        const activeRound = await prisma.fundingRound.findFirst({
          where: {
            status: 'ACTIVE',
          id: { not: roundId },
        },
      });

      if (activeRound) {
        return {
          valid: false,
          error: "Another funding round is already active",
        };
      }
      }
    }
  }

  return { valid: true };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await request.json();
    const id = (await context.params).id;

    // Validate status
    const validStatuses: FundingRoundStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status as FundingRoundStatus)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get current funding round
    const currentRound = await prisma.fundingRound.findUnique({
      where: { id },
    });

    if (!currentRound) {
      return NextResponse.json(
        { error: "Funding round not found" },
        { status: 404 }
      );
    }

    // Validate status transitions
    const isValidTransition = await validateStatusTransition(
      currentRound.status as FundingRoundStatus,
      status as FundingRoundStatus,
      currentRound.id
    );

    if (!isValidTransition.valid) {
      return NextResponse.json(
        { error: isValidTransition.error },
        { status: 400 }
      );
    }

    // Update funding round status
    const updatedRound = await prisma.fundingRound.update({
      where: { id },
      data: { status },
      include: {
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
        topic: {
          include: {
            reviewerGroups: {
              include: {
                reviewerGroup: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedRound);
  } catch (error) {
    console.error("Failed to update funding round status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 