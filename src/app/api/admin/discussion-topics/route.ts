import { NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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

    const topics = await adminService.getTopics();
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Failed to fetch topics:", error);
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

    const { name, description, reviewerGroupIds } = await req.json();
    const topic = await adminService.createTopic(
      name,
      description,
      user.id,
      reviewerGroupIds
    );
    return NextResponse.json(topic);
  } catch (error) {
    console.error("Failed to create topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
