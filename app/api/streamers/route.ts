// app/api/streamers/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { streamers } from '@/server/db/schema';
import { asc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select().from(streamers).orderBy(asc(streamers.id)).limit(100);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const displayName = String(body?.displayName ?? '').trim();
    if (!displayName) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    const [inserted] = await db
      .insert(streamers)
      .values({ displayName, isVerified: false })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}
