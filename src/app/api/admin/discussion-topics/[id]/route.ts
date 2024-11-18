import { NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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

    const topic = await adminService.getTopicById((await context.params).id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Failed to fetch topic:", error);
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

    const { name, description, reviewerGroupIds } = await request.json();
    const topic = await adminService.updateTopicWithReviewerGroups(
      (
        await context.params
      ).id,
      {
        name,
        description,
      },
      reviewerGroupIds
    );

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Failed to update topic:", error);
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

    await adminService.deleteTopic((await context.params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
