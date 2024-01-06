import { z } from "zod";

const envSchema = z.object({
  AZURE_STORAGE_CONNECTION_STRING: z.string(),
  BUGSNAG_API_KEY: z.string(),
  DB_CONNECTION_STRING: z.string(),
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("3000"),
});

export const envVars = envSchema.parse(process.env);
