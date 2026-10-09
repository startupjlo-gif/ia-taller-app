import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/session-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get('pin') || 'IA-2026';
  const session = await getOrCreateSession(pin);

  return NextResponse.json(session, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
