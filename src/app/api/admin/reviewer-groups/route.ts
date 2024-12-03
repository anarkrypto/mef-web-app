import { NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import logger from "@/logging";

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

    const groups = await adminService.getReviewerGroups();
    return NextResponse.json(groups);
  } catch (error) {
    logger.error("Failed to fetch reviewer groups:", error);
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

    const { name, description } = await req.json();
    const group = await adminService.createReviewerGroup(
      name,
      description,
      user.id
    );
    return NextResponse.json(group);
  } catch (error) {
    logger.error("Failed to create reviewer group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
