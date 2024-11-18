import { NextResponse } from "next/server";
import { AdminCheckService } from "@/services/AdminCheckService";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = await AdminCheckService.checkAdminStatus(
      user.id,
      user.linkId
    );
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Admin check failed:", error);
    return NextResponse.json({ isAdmin: false });
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
