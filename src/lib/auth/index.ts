import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { resolveUser } from "../user/resolve";
import type { User } from "@prisma/client";

export async function getUserFromRequest(req: Request): Promise<User | null> {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    // Verify the token and get payload
    const payload = await verifyToken(accessToken);

    // Resolve user from payload
    const { user } = await resolveUser(payload);
    return user;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
