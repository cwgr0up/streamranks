// app/api/aliases/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../src/server/db';
import { streamerAliases, platforms, streamers } from '../../../src/server/db/schema';
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
    const body = (await req.json()) as unknown;
    const b = body as Record<string, unknown>;

    const streamerId = Number(b.streamerId);
    const platformId = Number(b.platformId);
    const alias = typeof b.alias === 'string' ? (b.alias as string).trim() : '';
    const profileUrl = typeof b.profileUrl === 'string' ? (b.profileUrl as string) : undefined;
    const isPrimary = Boolean(b.isPrimary ?? false);

    if (!streamerId || !platformId || !alias) {
      return NextResponse.json(
        { error: 'streamerId, platformId, and alias are required' },
        { status: 400 },
      );
    }

    const [s] = await db.select().from(streamers).where(eq(streamers.id, streamerId)).limit(1);
    if (!s) return NextResponse.json({ error: 'streamerId not found' }, { status: 404 });

    const [p] = await db.select().from(platforms).where(eq(platforms.id, platformId)).limit(1);
    if (!p) return NextResponse.json({ error: 'platformId not found' }, { status: 404 });

    const [dup] = await db
      .select()
      .from(streamerAliases)
      .where(and(eq(streamerAliases.platformId, platformId), eq(streamerAliases.alias, alias)))
      .limit(1);
    if (dup) {
      return NextResponse.json({ error: 'alias already exists on this platform' }, { status: 409 });
    }

    const [inserted] = await db
      .insert(streamerAliases)
      .values({ streamerId, platformId, alias, profileUrl, isPrimary })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
