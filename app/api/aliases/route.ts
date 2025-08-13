// app/api/aliases/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { streamerAliases, platforms, streamers } from '@/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/aliases?streamerId=123
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sid = Number(searchParams.get('streamerId') ?? 0);
  if (!sid) return NextResponse.json({ error: 'Provide streamerId' }, { status: 400 });

  const rows = await db
    .select()
    .from(streamerAliases)
    .where(eq(streamerAliases.streamerId, sid))
    .orderBy(asc(streamerAliases.id));

  return NextResponse.json(rows);
}

// POST /api/aliases  { streamerId, platformId, alias, profileUrl?, isPrimary? }
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const streamerId = Number(body?.streamerId);
    const platformId = Number(body?.platformId);
    const alias = String(body?.alias ?? '').trim();
    const profileUrl = body?.profileUrl ? String(body.profileUrl) : undefined;
    const isPrimary = Boolean(body?.isPrimary ?? false);

    if (!streamerId || !platformId || !alias) {
      return NextResponse.json(
        { error: 'streamerId, platformId, and alias are required' },
        { status: 400 }
      );
    }

    // ensure FK rows exist
    const [s] = await db.select().from(streamers).where(eq(streamers.id, streamerId)).limit(1);
    if (!s) return NextResponse.json({ error: 'streamerId not found' }, { status: 404 });

    const [p] = await db.select().from(platforms).where(eq(platforms.id, platformId)).limit(1);
    if (!p) return NextResponse.json({ error: 'platformId not found' }, { status: 404 });

    // unique per (platform, alias)
    const [dup] = await db
      .select()
      .from(streamerAliases)
      .where(and(eq(streamerAliases.platformId, platformId), eq(streamerAliases.alias, alias)))
      .limit(1);
    if (dup) return NextResponse.json({ error: 'alias already exists on this platform' }, { status: 409 });

    const [inserted] = await db
      .insert(streamerAliases)
      .values({ streamerId, platformId, alias, profileUrl, isPrimary })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}
