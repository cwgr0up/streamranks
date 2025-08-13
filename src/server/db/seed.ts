// src/server/db/seed.ts

// 1. Load env vars before anything else
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // load local development env first
dotenv.config(); // fallback to .env if present

// 2. Now it's safe to import DB code
import { db } from './index';
import { platforms } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const existing = await db.query.platforms.findFirst({
    where: eq(platforms.id, 1),
  });

  if (!existing) {
    await db.insert(platforms).values({
      id: 1,
      slug: 'favorited',
      name: 'Favorited',
      websiteUrl: 'https://favorited.io',
    });
    console.log('Seeded: platforms (favorited id=1)');
  } else {
    console.log('Seed skipped: favorited already exists');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
