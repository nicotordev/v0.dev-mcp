import { createVercel } from "@ai-sdk/vercel";
import "dotenv/config";

// Validate environment variables
export const V0_API_KEY = process.env["V0_API_KEY"];
if (!V0_API_KEY) {
  console.error("V0_API_KEY environment variable is required");
  process.exit(1);
}

// Configure the v0 provider and model
export const vercelProvider = createVercel({
  apiKey: V0_API_KEY,
});

export const v0Model = vercelProvider("v0-1.5-md");
