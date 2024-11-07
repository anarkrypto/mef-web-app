import dotenv from "dotenv";

// Load environment variables for scripts
dotenv.config();

export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY_RS512;
export const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY_RS512;

if (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY) {
  throw new Error(
    "JWT_PRIVATE_KEY_RS512 and JWT_PUBLIC_KEY_RS512 environment variables must be set"
  );
}
