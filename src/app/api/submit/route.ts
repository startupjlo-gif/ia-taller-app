import { NextRequest, NextResponse } from 'next/server';
import {
  submitLevel0,
  submitLevel1,
  submitLevel2,
  submitLevel3,
  submitLevel4
} from '@/lib/session-store';
import { calculateLevel1Result } from '@/lib/logic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin = 'IA-2026', level, participantId, participantName, data } = body;

    if (!participantId) {
      return NextResponse.json({ error: 'Missing participantId' }, { status: 400 });
    }

    if (level === 0) {
      const session = await submitLevel0(pin, {
        participantId,
        participantName: participantName || 'Participante',
        matches: data.matches,
        submittedAt: Date.now()
      });
      return NextResponse.json({ success: true, session });
    }

    if (level === 1) {
      const result = calculateLevel1Result(
        participantId,
        participantName || 'Participante',
        data.answers
      );
      const session = await submitLevel1(pin, result);
      return NextResponse.json({ success: true, result, session });
    }

    if (level === 2) {
      const session = await submitLevel2(pin, {
        participantId,
        participantName: participantName || 'Participante',
        cases: data.cases,
        score: data.score,
        submittedAt: Date.now()
      });
      return NextResponse.json({ success: true, session });
    }

    if (level === 3) {
      const session = await submitLevel3(pin, {
        participantId,
        participantName: participantName || 'Participante',
        answers: data.answers,
        score: data.score,
        submittedAt: Date.now()
      });
      return NextResponse.json({ success: true, session });
    }

    if (level === 4) {
      const session = await submitLevel4(pin, {
        participantId,
        participantName: participantName || 'Participante',
        matches: data.matches,
        score: data.score,
        submittedAt: Date.now()
      });
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
