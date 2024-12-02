import { NextResponse } from "next/server";
import { verifyToken, generateTokenPair } from "@/lib/auth/jwt";
import logger from "@/logging";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { initialToken } = await request.json();

    if (!initialToken) {
      return NextResponse.json(
        { error: "Initial token is required" },
        { status: 400 }
      );
    }

    // Verify the initial token
    const payload = await verifyToken(initialToken);

    // Generate new token pair
    const { accessToken, refreshToken } = await generateTokenPair(
      payload.authSource
    );

    // Create response with cookies
    const response = NextResponse.json({ success: true });

    // Set cookies
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Token exchange error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
