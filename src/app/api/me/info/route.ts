import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { resolveUser } from "@/lib/user/resolve";
import { verifyToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT and get payload
    const payload = await verifyToken(accessToken);

    // Resolve or create user
    const { user, created } = await resolveUser(payload);

    // Return user info with creation status
    return NextResponse.json({
      user,
      created,
    });
  } catch (error) {
    console.error("User info error:", error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // If token is invalid, return 401
    if (error instanceof Error && error.message === "Invalid token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For other errors, return 500 with more details in development
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
