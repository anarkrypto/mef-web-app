import { NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { validatePhaseDates } from "@/lib/validation";

const adminService = new AdminService(prisma);

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rounds = await adminService.getFundingRounds();
    return NextResponse.json(rounds);
  } catch (error) {
    console.error("Failed to fetch funding rounds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    // Validate phase dates
    const datesValid = validatePhaseDates({
      fundingRound: {
        from: new Date(data.fundingRoundDates.from),
        to: new Date(data.fundingRoundDates.to),
      },
      consideration: {
        from: new Date(data.considerationDates.from),
        to: new Date(data.considerationDates.to),
      },
      deliberation: {
        from: new Date(data.deliberationDates.from),
        to: new Date(data.deliberationDates.to),
      },
      voting: {
        from: new Date(data.votingDates.from),
        to: new Date(data.votingDates.to),
      },
    });

    if (!datesValid.valid) {
      return NextResponse.json({ error: datesValid.error }, { status: 400 });
    }

    const round = await adminService.createFundingRound({
      ...data,
      createdById: user.id,
    });
    return NextResponse.json(round);
  } catch (error) {
    console.error("Failed to create funding round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
