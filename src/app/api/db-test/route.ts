import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await prisma.\\SELECT 1\;
    const users = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({ ok: true, db: 'connected', users: users.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
