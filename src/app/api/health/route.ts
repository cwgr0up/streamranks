import { NextResponse } from "next/server";

export async function GET() {
  const t = new Date().toISOString();
  console.log(`[health] ping at ${t}`);
  return NextResponse.json({ ok: true, ts: t });
}
