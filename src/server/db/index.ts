// src/server/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // <-- add this

const url = process.env.DATABASE_URL ?? process.env.DRIZZLE_DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL / DRIZZLE_DATABASE_URL is not set');
}

export const sql = neon(url);
// Pass schema so db.query.* is generated
export const db = drizzle(sql, { schema });
export { schema }; // optional re-export for convenience elsewhere
