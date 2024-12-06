import { verifyToken, generateTokenPair, setTokenCookies } from "@/lib/auth/jwt";
import { AppError } from "@/lib/errors";
import { ApiResponse } from "@/lib/api-response";
import logger from "@/logging";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { initialToken } = await request.json();

    if (!initialToken) {
      throw new AppError("Initial token is required", 400);
    }

    // Verify the initial token
    const payload = await verifyToken(initialToken);

    // Generate new token pair
    const { accessToken, refreshToken } = await generateTokenPair(
      payload.authSource
    );

    // Create response and set cookies
    const response = ApiResponse.success({ success: true });
    return setTokenCookies(response, accessToken, refreshToken);

  } catch (error) {
    logger.error("Token exchange error:", error);
    return ApiResponse.error(error);
  }
}