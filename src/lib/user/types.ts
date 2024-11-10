import type { User } from "@prisma/client";

export interface AuthSource {
  type: "discord" | "telegram" | "wallet";
  id: string;
  username: string;
}

export interface JWTPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  authSource: AuthSource;
}

export interface UserResolutionResult {
  user: User;
  created: boolean;
}
