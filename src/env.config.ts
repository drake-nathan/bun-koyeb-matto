import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.string().default("development"),
  DB_CONNECTION_STRING: z.string(),
  AZURE_STORAGE_CONNECTION_STRING: z.string(),
  BUGSNAG_API_KEY: z.string(),
});

export const envVars = envSchema.parse(process.env);
