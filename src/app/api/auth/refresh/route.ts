import { cookies } from "next/headers";
import { verifyToken, generateTokenPair, setTokenCookies } from "@/lib/auth/jwt";
import { AppError } from "@/lib/errors";
import { ApiResponse } from "@/lib/api-response";
import logger from "@/logging";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      throw new AppError("No refresh token", 401);
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      payload.authSource
    );

    // Create response and set cookies
    const response = ApiResponse.success({ success: true });
    return setTokenCookies(response, accessToken, newRefreshToken);

  } catch (error) {
    logger.error("Token refresh error:", error);
    return ApiResponse.error(error);
  }
}
