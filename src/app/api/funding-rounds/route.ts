import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import logger from "@/logging";

export async function GET(req: Request) {
  try {
    const user = await getOrCreateUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all funding rounds with their phases
    const rounds = await prisma.fundingRound.findMany({
      include: {
        proposals: true,
        submissionPhase: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
        topic: true,
      },
      orderBy: [
        { status: 'desc' }, // ACTIVE rounds first
        { startDate: 'desc' }, // Then by start date
      ],
    });

    return NextResponse.json(rounds);
  } catch (error) {
    logger.error("Failed to fetch funding rounds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 