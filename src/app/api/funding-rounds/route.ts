import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all funding rounds with their phases
    const rounds = await prisma.fundingRound.findMany({
      include: {
        proposals: true,
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
    console.error("Failed to fetch funding rounds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 