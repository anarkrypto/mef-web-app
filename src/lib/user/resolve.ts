import prisma from "@/lib/prisma";
import { deriveUserId, generateLinkId } from "./derive";
import type { JWTPayload, UserResolutionResult, AuthSource } from "./types";

// Helper function to make AuthSource serializable
function serializeAuthSource(authSource: AuthSource) {
  return {
    type: authSource.type,
    id: authSource.id,
    username: authSource.username,
  } as const;
}


