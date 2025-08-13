// app/api/db-health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sql as dsql } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const ok = await db.execute(dsql`select 1 as ok`);
    const tablesRes = await db.execute(dsql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);

    const rows = (r: any) => (Array.isArray(r) ? r : r?.rows ?? []);
    const okRow = rows(ok)[0];
    const tables = rows(tablesRes).map((r: any) => r.table_name ?? Object.values(r)[0]);

    return NextResponse.json({ ok: okRow?.ok === 1, tables });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
