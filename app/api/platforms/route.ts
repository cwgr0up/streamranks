// app/api/platforms/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../src/server/db';
import { platforms } from '../../../src/server/db/schema';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  // 🔒 guard GET with x-admin-secret
  const auth = req.headers.get('x-admin-secret');
  if (auth !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db.select().from(platforms).orderBy(platforms.id);
  return NextResponse.json(rows);
}
