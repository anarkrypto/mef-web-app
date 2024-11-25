import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

// Move admin check to a separate API route
async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return false;

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/check`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    console.error("Admin check failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  console.log(
    "[Middleware] Processing request for path:",
    request.nextUrl.pathname
  );
  const path = request.nextUrl.pathname;

  // Allow auth paths first, before any other checks
  if (AUTH_PATHS.includes(path)) {
    console.log("[Middleware] Allowing auth path:", path);
    return NextResponse.next();
  }

  // Check for admin routes
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    (request.nextUrl.pathname.startsWith("/api/admin") &&
      !AUTH_PATHS.includes(path))
  ) {
    const isAdmin = await checkAdminAccess(request);
    if (!isAdmin) {
      // Redirect to home with error message
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(url);
    }
  }

  // Allow public paths without authentication
  if (PUBLIC_PATHS.includes(path)) {
    console.log("[Middleware] Allowing public path:", path);
    return NextResponse.next();
  }

  // Get both tokens
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log("[Middleware] Token status:", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });

  // If no tokens at all, redirect to auth
  if (!accessToken && !refreshToken) {
    console.log("[Middleware] No tokens found, redirecting to auth");
    return redirectToAuth(request, "Please log in to continue");
  }

  // Try to use access token first
  if (accessToken) {
    try {
      console.log("[Middleware] Attempting to verify access token");
      await verifyToken(accessToken);
      console.log("[Middleware] Access token verified successfully");
      return NextResponse.next();
    } catch (error) {
      // Access token invalid, try refresh flow
      console.error("[Middleware] Access token verification failed:", error);
    }
  }

  // Try refresh flow if we have a refresh token
  if (refreshToken) {
    try {
      console.log("[Middleware] Attempting token refresh");
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/refresh`, 
        {
          method: "POST",
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Refresh failed with status: ${response.status}`);
      }

      console.log("[Middleware] Token refresh successful");

      // Get the Set-Cookie headers
      const setCookieHeader = response.headers.get("set-cookie");

      // Create response that continues to the original URL
      const res = NextResponse.next();

      // Copy the cookies if they exist
      if (setCookieHeader) {
        const cookies = setCookieHeader.split(", ");
        cookies.forEach((cookie: string) => {
          res.headers.append("Set-Cookie", cookie);
        });
      }

      return res;
    } catch (error) {
      console.error("[Middleware] Token refresh failed:", error);
      return redirectToAuth(
        request,
        "Your session has expired. Please log in again."
      );
    }
  }

  // No valid tokens and refresh failed
  console.log("[Middleware] Authentication required - no valid tokens");
  return redirectToAuth(request, "Authentication required");
}

function redirectToAuth(request: NextRequest, message?: string) {
  const url = new URL("/auth", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  if (message) {
    url.searchParams.set("message", message);
  }
  console.log("[Middleware] Redirecting to auth:", url.toString());
  return NextResponse.redirect(url);
}

// Define public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/auth"];
const AUTH_PATHS = [
  "/api/auth/exchange",
  "/api/auth/refresh",
  "/api/admin/check",
];
