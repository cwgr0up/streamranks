// app/api/streamers/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../src/server/db';
import { streamers } from '../../../src/server/db/schema';
import { asc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select().from(streamers).orderBy(asc(streamers.id)).limit(100);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const displayName = typeof (body as Record<string, unknown>)?.displayName === 'string'
      ? ((body as Record<string, unknown>).displayName as string).trim()
      : '';

    if (!displayName) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    const [inserted] = await db
      .insert(streamers)
      .values({ displayName, isVerified: false })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
