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
      where: {
        status: "ACTIVE",
      },
      include: {
        submissionPhase: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
        topic: true,
      },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    logger.error("Failed to fetch active funding rounds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
