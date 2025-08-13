// app/api/db-health/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../src/server/db';
import { sql as dsql } from 'drizzle-orm';

export const runtime = 'nodejs';

type Row = Record<string, unknown>;
const toRows = (r: unknown): Row[] => {
  if (Array.isArray(r)) return r as Row[];
  if (r && typeof r === 'object' && 'rows' in (r as Record<string, unknown>)) {
    const rows = (r as { rows?: Row[] }).rows;
    return Array.isArray(rows) ? rows : [];
  }
  return [];
};

export async function GET() {
  try {
    const okRes = await db.execute(dsql`select 1 as ok`);
    const tablesRes = await db.execute(dsql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);

    const okRow = toRows(okRes)[0] as { ok?: number } | undefined;
    const tables = toRows(tablesRes).map((r) => String(r.table_name ?? r.tableName ?? Object.values(r)[0] ?? ''));

    return NextResponse.json({ ok: okRow?.ok === 1, tables });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
