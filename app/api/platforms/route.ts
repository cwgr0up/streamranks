// app/api/platforms/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { platforms } from '@/server/db/schema';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select().from(platforms).orderBy(platforms.id);
  return NextResponse.json(rows);
}
