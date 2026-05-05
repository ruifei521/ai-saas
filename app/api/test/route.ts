import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}