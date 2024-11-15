import * as jose from "jose";
import { cookies } from "next/headers";

// Define environment variable types
let privateKey: jose.KeyLike;
let publicKey: jose.KeyLike;

// Initialize keys based on environment
async function initializeKeys() {
  const privateKeyStr = process.env.JWT_PRIVATE_KEY_RS512;
  const publicKeyStr = process.env.JWT_PUBLIC_KEY_RS512;

  if (!privateKeyStr || !publicKeyStr) {
    throw new Error(
      "JWT_PRIVATE_KEY_RS512 and JWT_PUBLIC_KEY_RS512 environment variables must be set"
    );
  }

  // Import keys
  privateKey = await jose.importPKCS8(privateKeyStr, "RS512");
  publicKey = await jose.importSPKI(publicKeyStr, "RS512");
}

// Move JWT operations to a server-side utility
export const JWTUtils = {
  generateInitialToken: async (
    authSource: JWTPayload["authSource"]
  ): Promise<string> => {
    if (!privateKey) await initializeKeys();

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 30; // 30 seconds

    const jwt = await new jose.SignJWT({
      authSource,
      iss: "initial",
      sub: authSource.id,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "RS512" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(privateKey);

    return jwt;
  },

  generateTokenPair: async (authSource: JWTPayload["authSource"]) => {
    if (!privateKey) await initializeKeys();

    const iat = Math.floor(Date.now() / 1000);

    const accessToken = await new jose.SignJWT({
      authSource,
      iss: "access",
      sub: authSource.id,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "RS512" })
      .setIssuedAt(iat)
      .setExpirationTime("15m")
      .sign(privateKey);

    const refreshToken = await new jose.SignJWT({
      authSource,
      iss: "refresh",
      sub: authSource.id,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "RS512" })
      .setIssuedAt(iat)
      .setExpirationTime("7d")
      .sign(privateKey);

    return { accessToken, refreshToken };
  },

  verifyToken: async (token: string): Promise<JWTPayload> => {
    if (!publicKey) await initializeKeys();

    try {
      const { payload } = await jose.jwtVerify(token, publicKey, {
        algorithms: ["RS512"],
      });

      if (!payload.authSource || !payload.iss || !payload.jti || !payload.sub) {
        throw new Error("Missing required token fields");
      }

      return {
        ...payload,
        sub: payload.sub,
        authSource: payload.authSource as JWTPayload["authSource"],
      } as JWTPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Invalid token");
    }
  },

  setTokenCookies: async (accessToken: string, refreshToken: string) => {
    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
  },
};

export interface JWTPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  authSource: {
    type: "discord" | "telegram" | "wallet";
    id: string;
    username: string;
  };
}

// Export the functions with the same names for backward compatibility
export const {
  generateInitialToken,
  generateTokenPair,
  verifyToken,
  setTokenCookies,
} = JWTUtils;
