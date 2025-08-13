import { NextResponse } from 'next/server';
import { db } from '../../../src/server/db';
import { platforms } from '../../../src/server/db/schema';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select().from(platforms).orderBy(platforms.id);
  return NextResponse.json(rows);
}
