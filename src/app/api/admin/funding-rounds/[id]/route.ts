import { NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { validatePhaseDates } from "@/lib/validation";

const adminService = new AdminService(prisma);

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const round = await adminService.getFundingRoundById(
      (
        await context.params
      ).id
    );
    if (!round) {
      return NextResponse.json(
        { error: "Funding round not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(round);
  } catch (error) {
    console.error("Failed to fetch funding round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

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

    const round = await adminService.updateFundingRound(
      (
        await context.params
      ).id,
      data
    );

    return NextResponse.json(round);
  } catch (error) {
    console.error("Failed to update funding round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await adminService.checkAdminStatus(user.id, user.linkId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminService.deleteFundingRound((await context.params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete funding round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
