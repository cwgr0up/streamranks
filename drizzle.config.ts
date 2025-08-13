// drizzle.config.ts
import * as dotenv from 'dotenv';

// Try .env.local first (dev), then also load .env as a fallback
dotenv.config({ path: '.env.local' });
dotenv.config();

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
