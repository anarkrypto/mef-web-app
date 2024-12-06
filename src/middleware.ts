import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";
import { AppError } from "./lib/errors";
import logger from "./logging";
import { JWTPayload } from "jose";

const getBaseUrl = () => process.env.NEXT_APP_URL;

// Configuration
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

// Route definitions
const PUBLIC_PATHS = ["/", "/auth"] as const;
const AUTH_PATHS = [
  "/api/auth/exchange",
  "/api/auth/refresh",
  "/api/admin/check",
  "/api/auth/wallet",
  "/api/me/info",
] as const;

// Type helpers
type PublicPath = typeof PUBLIC_PATHS[number];
type AuthPath = typeof AUTH_PATHS[number];

// Path checking helpers
function isPublicPath(path: string): path is PublicPath {
  return (PUBLIC_PATHS as readonly string[]).includes(path);
}

function isAuthPath(path: string): path is AuthPath {
  return (AUTH_PATHS as readonly string[]).includes(path);
}

// Route type determination
type RouteType = 'api' | 'web' | 'admin';

function getRouteType(path: string): RouteType {
  if (path.startsWith('/api/admin')) return 'admin';
  if (path.startsWith('/api')) return 'api';
  if (path.startsWith('/admin')) return 'admin';
  return 'web';
}

/**
 * Manages cookie operations for authentication tokens
 */
class CookieManager {
  private response: NextResponse;
  private request: NextRequest;

  constructor(request: NextRequest, response: NextResponse) {
    this.request = request;
    this.response = response;
  }

  /**
   * Gets authentication tokens from request cookies
   */
  getRequestTokens() {
    return {
      accessToken: this.request.cookies.get("access_token")?.value ?? null,
      refreshToken: this.request.cookies.get("refresh_token")?.value ?? null
    };
  }

  /**
   * Gets authentication tokens from response cookies
   */
  getResponseTokens() {
    return {
      accessToken: this.response.cookies.get("access_token")?.value ?? null,
      refreshToken: this.response.cookies.get("refresh_token")?.value ?? null
    };
  }

  /**
   * Sets authentication tokens in response cookies
   */
  setTokens(accessToken: string | null, refreshToken: string | null) {
    if (accessToken) {
      this.response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }

    if (refreshToken) {
      this.response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }
  }

  /**
   * Clears authentication tokens from response cookies
   */
  clearTokens() {
    this.response.cookies.delete("access_token");
    this.response.cookies.delete("refresh_token");
  }
}

// Update the checkAdminAccess function to accept an access token
async function checkAdminAccess(accessToken: string): Promise<boolean> {
  try {
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
    logger.error("[Middleware] Admin check failed:", error);
    return false;
  }
}

async function handleTokenRefresh(refreshToken: string, cookieManager: CookieManager): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      return false;
    }

    // Get all Set-Cookie headers
    const cookies = refreshResponse.headers.getSetCookie();
    
    // Parse the cookies to get the new tokens
    const newAccessToken = cookies
      .find(cookie => cookie.startsWith('access_token='))
      ?.split(';')[0]
      .split('=')[1];
    
    const newRefreshToken = cookies
      .find(cookie => cookie.startsWith('refresh_token='))
      ?.split(';')[0]
      .split('=')[1];

    // Set the new tokens using the cookie manager
    cookieManager.setTokens(newAccessToken ?? null, newRefreshToken ?? null);

    return true;
  } catch (error) {
    logger.error("[Middleware] Token refresh failed:", error);
    return false;
  }
}

// Update authenticateRequest to use CookieManager
async function authenticateRequest(cookieManager: CookieManager): Promise<AuthResult> {
  const { accessToken, refreshToken } = cookieManager.getRequestTokens();

  // No tokens available
  if (!accessToken && !refreshToken) {
    return { isAuthenticated: false, error: "No authentication tokens" };
  }

  // Try access token
  if (accessToken) {
    try {
      await verifyToken(accessToken);
      const isAdmin = await checkAdminAccess(accessToken);
      
      return {
        isAuthenticated: true,
        isAdmin,
      };
    } catch (error) {
      logger.debug("[Middleware] Access token invalid, will attempt refresh");
    }
  }

  // Try refresh token
  if (refreshToken) {
    try {
      const refreshSuccessful = await handleTokenRefresh(refreshToken, cookieManager);
      if (refreshSuccessful) {
        const { accessToken: newAccessToken } = cookieManager.getResponseTokens();
        if (newAccessToken) {
          const isAdmin = await checkAdminAccess(newAccessToken);
          return {
            isAuthenticated: true,
            isAdmin,
          };
        }
      }
    } catch (error) {
      logger.error("[Middleware] Refresh failed:", error);
    }
  }

  return { isAuthenticated: false, error: "Authentication failed" };
}

// Update middleware function to use CookieManager
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const routeType = getRouteType(path);

  logger.debug("[Middleware] Processing request:", { path, routeType });

  const response = NextResponse.next();
  const cookieManager = new CookieManager(request, response);

  // For authentication requests, just authenticate
  if (isAuthPath(path)) {
    return response;
  }

  // Not auth request: authenticate and check permissions
  const authResult = await authenticateRequest(cookieManager);

  // Skip authentication for public paths
  if (isPublicPath(path)) {
    return response;
  }

  // Handle response based on authentication and permissions
  return handleAuthResponse(request, routeType, authResult, response);
}

/**
 * First layer ensuring API access only to authenticated users.
 * @param routeType 
 * @param request 
 * @returns 
 */
function generateUnauthorizedResponse(routeType: RouteType, request: NextRequest): NextResponse {
  // All calls under /api/ must be authenticated. This is a first-layer guard, but individual
  // routes must implement the check as well
  if (routeType === 'api') {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL("/auth", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  url.searchParams.set("message", "Please log in to continue");
  return NextResponse.redirect(url);
}

function generateAdminUnauthorizedResponse(routeType: RouteType, request: NextRequest): NextResponse {
  if (routeType === 'api') {
    return new NextResponse(
      JSON.stringify({ error: "Admin access required" }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // For web routes, redirect to home with error
  const url = new URL("/", request.url);
  url.searchParams.set("error", "unauthorized_admin");
  return NextResponse.redirect(url);
}

/**
 * Authentication result with payload and permissions
 */
interface AuthResult {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  error?: string;
}

/**
 * Handles the response based on route type and auth result
 */
function handleAuthResponse(
  request: NextRequest,
  routeType: RouteType,
  authResult: AuthResult,
  response: NextResponse
): NextResponse {
  // Authentication failed
  if (!authResult.isAuthenticated) {
    return generateUnauthorizedResponse(routeType, request);
  }

  // Admin route but not admin
  if (routeType === 'admin' && !authResult.isAdmin) {
    return generateAdminUnauthorizedResponse(routeType, request);
  }

  // Authentication successful and permissions valid
  return response;
}