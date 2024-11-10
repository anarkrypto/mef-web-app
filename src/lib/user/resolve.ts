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

export async function resolveUser(
  jwt: JWTPayload
): Promise<UserResolutionResult> {
  const userId = deriveUserId(jwt.authSource);

  // Try to find existing user
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    return { user: existingUser, created: false };
  }

  // Create new user if not found
  const newUser = await prisma.user.create({
    data: {
      id: userId,
      linkId: generateLinkId(),
      metadata: {
        authSource: serializeAuthSource(jwt.authSource),
        username: jwt.authSource.username,
        createdAt: new Date().toISOString(),
      },
    },
  });

  return { user: newUser, created: true };
}
