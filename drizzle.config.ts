// drizzle.config.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // dev-first
dotenv.config(); // fallback to .env

import { defineConfig } from 'drizzle-kit';

const env = process.env as Record<string, string | undefined>;
const url = env['DRIZZLE_DATABASE_URL'] ?? env['DATABASE_URL'];

if (!url) {
  throw new Error('DRIZZLE_DATABASE_URL / DATABASE_URL is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
