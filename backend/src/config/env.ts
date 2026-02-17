import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
  REDIS_URL: z.string(),
});

export const env = envSchema.parse(process.env);
