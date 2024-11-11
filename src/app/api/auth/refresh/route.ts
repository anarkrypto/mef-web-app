import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, generateTokenPair } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } =
      await generateTokenPair(payload.authSource);

    // Create response with new cookies
    const response = NextResponse.json({ success: true });

    // Set new cookies in response
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
