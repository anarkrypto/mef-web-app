import logger from "@/logging";
import { generateInitialToken } from "../lib/auth/jwt";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the root .env file
const envPath = path.resolve(process.cwd(), ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Failed to load .env file:", result.error);
  process.exit(1);
}

async function main() {
  const [, , authSourceType, authSourceId, username] = process.argv;

  if (!authSourceType || !authSourceId || !username) {
    console.error("Usage: generate-auth-token <type> <id> <username>");
    process.exit(1);
  }

  if (!["discord", "telegram", "wallet"].includes(authSourceType)) {
    console.error("Error: type must be one of: discord, telegram, wallet");
    process.exit(1);
  }

  try {
    const token = await generateInitialToken({
      type: authSourceType as "discord" | "telegram" | "wallet",
      id: authSourceId,
      username,
    });

    const url = `http://localhost:3000/auth?token=${token}`;

    logger.debug("\nToken generated successfully!");
    logger.debug("=".repeat(50));
    logger.debug("Token:", token);
    logger.debug("-".repeat(50));
    logger.debug("Login URL:", url);
    logger.debug("=".repeat(50));
  } catch (error) {
    console.error(
      "Error generating token:",
      error instanceof Error ? error.message : error
    );
    console.error(`env path: ${envPath}. `);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
