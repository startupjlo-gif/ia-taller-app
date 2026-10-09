import { NextRequest, NextResponse } from 'next/server';
import {
  setActiveLevel,
  resetSession,
  generateDemoData,
  getOrCreateSession
} from '@/lib/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin = 'IA-2026', levelId } = body;

    let session = await getOrCreateSession(pin);

    if (action === 'setLevel') {
      session = await setActiveLevel(pin, levelId);
    } else if (action === 'reset') {
      session = await resetSession(pin);
    } else if (action === 'generateDemo') {
      session = await generateDemoData(pin);
    }

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
