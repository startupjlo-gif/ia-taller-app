import {
  SessionData,
  LevelId,
  Level0Answer,
  Level1Result,
  Level2Submission,
  Level3Submission,
  Level4Submission,
  Participant
} from './types';
import { calculateLevel1Result } from './logic';
import fs from 'fs';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __WORKSHOP_SESSIONS__: Record<string, SessionData> | undefined;
}

if (!globalThis.__WORKSHOP_SESSIONS__) {
  globalThis.__WORKSHOP_SESSIONS__ = {};
}

const sessions = globalThis.__WORKSHOP_SESSIONS__;

// Local File Persistence Backup
const BACKUP_FILE = process.env.VERCEL
  ? path.join('/tmp', 'workshop_sessions_backup.json')
  : path.join(process.cwd(), '.sessions_backup.json');

function saveToDisk() {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(sessions), 'utf-8');
  } catch (err) {
    // Ignore read-only errors
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      Object.assign(sessions, loaded);
    }
  } catch (err) {
    // Ignore load errors
  }
}

loadFromDisk();

// Upstash Redis REST API Helper for 100% Cloud Persistence on Vercel
function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function syncToKV(pin: string, data: SessionData) {
  const kv = getRedisConfig();
  if (!kv) return;
  try {
    await fetch(`${kv.url}/set/session_${pin}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kv.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(data))
    });
  } catch (err) {
    console.error('KV Sync error:', err);
  }
}

async function loadFromKV(pin: string): Promise<SessionData | null> {
  const kv = getRedisConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/session_${pin}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.result) {
        return JSON.parse(json.result);
      }
    }
  } catch (err) {
    console.error('KV Load error:', err);
  }
  return null;
}

export async function getOrCreateSession(pin = 'IA-2026'): Promise<SessionData> {
  const cleanPin = pin.toUpperCase().trim();

  // Try reading from Upstash Redis if configured
  const kvData = await loadFromKV(cleanPin);
  if (kvData) {
    sessions[cleanPin] = kvData;
    return kvData;
  }

  if (!sessions[cleanPin]) {
    sessions[cleanPin] = {
      pin: cleanPin,
      activeLevel: 0,
      participants: [],
      level0Answers: [],
      level1Results: [],
      level2Submissions: [],
      level3Submissions: [],
      level4Submissions: [],
      updatedAt: Date.now()
    };
    saveToDisk();
    await syncToKV(cleanPin, sessions[cleanPin]);
  }
  return sessions[cleanPin];
}

export async function registerParticipant(pin: string, id: string, name: string): Promise<Participant> {
  const session = await getOrCreateSession(pin);
  let participant = session.participants.find((p) => p.id === id);
  if (!participant) {
    participant = { id, name: name || 'Participante Anónimo', joinedAt: Date.now() };
    session.participants.push(participant);
  } else {
    participant.name = name;
  }
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return participant;
}

export async function setActiveLevel(pin: string, activeLevel: LevelId): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.activeLevel = activeLevel;
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function submitLevel0(pin: string, answer: Level0Answer): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level0Answers = session.level0Answers.filter(
    (a) => a.participantId !== answer.participantId
  );
  session.level0Answers.push(answer);
  await registerParticipant(pin, answer.participantId, answer.participantName);
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function submitLevel1(pin: string, result: Level1Result): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level1Results = session.level1Results.filter(
    (r) => r.participantId !== result.participantId
  );
  session.level1Results.push(result);
  await registerParticipant(pin, result.participantId, result.participantName);
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function submitLevel2(pin: string, submission: Level2Submission): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level2Submissions = session.level2Submissions.filter(
    (s) => s.participantId !== submission.participantId
  );
  session.level2Submissions.push(submission);
  await registerParticipant(pin, submission.participantId, submission.participantName);
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function submitLevel3(pin: string, submission: Level3Submission): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level3Submissions = session.level3Submissions.filter(
    (s) => s.participantId !== submission.participantId
  );
  session.level3Submissions.push(submission);
  await registerParticipant(pin, submission.participantId, submission.participantName);
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function submitLevel4(pin: string, submission: Level4Submission): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level4Submissions = session.level4Submissions.filter(
    (s) => s.participantId !== submission.participantId
  );
  session.level4Submissions.push(submission);
  await registerParticipant(pin, submission.participantId, submission.participantName);
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function resetSession(pin: string): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  session.level0Answers = [];
  session.level1Results = [];
  session.level2Submissions = [];
  session.level3Submissions = [];
  session.level4Submissions = [];
  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}

export async function generateDemoData(pin: string): Promise<SessionData> {
  const session = await getOrCreateSession(pin);
  const sampleNames = [
    'María García', 'Carlos Rodríguez', 'Ana Martínez', 'Javier López',
    'Elena Gómez', 'David Fernández', 'Laura Sánchez', 'Pablo Pérez',
    'Lucia Romero', 'Adrian Torres', 'Sofia Navarro', 'Mateo Ruiz',
    'Carmen Diaz', 'Hugo Serrano', 'Paula Morales'
  ];

  await resetSession(pin);

  for (let idx = 0; idx < sampleNames.length; idx++) {
    const name = sampleNames[idx];
    const id = `user_demo_${idx + 1}`;
    await registerParticipant(pin, id, name);

    // Level 0 Demo
    const l0Matches: Record<string, string> = {
      c1: 'c1',
      c2: 'c2',
      c3: 'c3',
      c4: idx % 4 === 0 ? 'c6' : 'c4',
      c5: 'c5',
      c6: 'c6',
      c7: 'c7'
    };
    await submitLevel0(pin, {
      participantId: id,
      participantName: name,
      matches: l0Matches,
      submittedAt: Date.now() - idx * 10000
    });

    // Level 1 Demo
    const q1Opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'B', 'C', 'D', 'A', 'C', 'B'];
    const q2Opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D', 'B', 'A', 'C', 'B'];
    const q3Opts: ('A' | 'B' | 'C')[] = ['A', 'B', 'C', 'B', 'A', 'C', 'B'];
    const q4Opts: ('A' | 'B' | 'C')[] = ['A', 'B', 'A', 'C', 'B'];
    const q5Opts: ('A' | 'B' | 'C')[] = ['A', 'B', 'C', 'A', 'B'];
    const q6Opts: ('A' | 'B' | 'C')[] = ['A', 'B', 'C', 'B', 'A'];

    const answers = {
      q1: q1Opts[idx % q1Opts.length],
      q2: q2Opts[idx % q2Opts.length],
      q3: q3Opts[idx % q3Opts.length],
      q4: q4Opts[idx % q4Opts.length],
      q5: q5Opts[idx % q5Opts.length],
      q6: q6Opts[idx % q6Opts.length]
    };

    const l1Result = calculateLevel1Result(id, name, answers);
    await submitLevel1(pin, l1Result);

    // Level 2 Demo
    const l2Cases = {
      1: {
        disparador: 'c1_opt1',
        cerebro: 'c1_opt2',
        accion: 'c1_opt3'
      },
      2: {
        disparador: 'c2_opt1',
        cerebro: 'c2_opt2',
        accion: idx % 3 === 0 ? 'c2_trap1' : 'c2_opt3'
      },
      3: {
        disparador: idx % 4 === 0 ? 'c3_trap1' : 'c3_opt1',
        cerebro: 'c3_opt2',
        accion: 'c3_opt3'
      }
    };
    let l2Score = 9;
    if (idx % 3 === 0) l2Score -= 1;
    if (idx % 4 === 0) l2Score -= 1;

    await submitLevel2(pin, {
      participantId: id,
      participantName: name,
      cases: l2Cases,
      score: l2Score,
      submittedAt: Date.now() - idx * 5000
    });

    // Level 3 Demo
    const l3Answers = {
      1: { causaId: 'causa_1', solucionId: 'sol_1' },
      2: { causaId: idx % 5 === 0 ? 'causa_trap1' : 'causa_2', solucionId: 'sol_2' },
      3: { causaId: 'causa_3', solucionId: 'sol_3' }
    };
    const l3Score = idx % 5 === 0 ? 5 : 6;
    await submitLevel3(pin, {
      participantId: id,
      participantName: name,
      answers: l3Answers,
      score: l3Score,
      submittedAt: Date.now() - idx * 4000
    });

    // Level 4 Demo
    const l4Matches = {
      ac_agente: 'm_agente',
      ac_mcp: 'm_mcp',
      ac_inyeccion: 'm_inyeccion',
      ac_predictivo: 'm_predictivo',
      ac_historicos: 'm_historicos',
      ac_ml: idx % 3 === 0 ? 'm_trap1' : 'm_ml'
    };
    const l4Score = idx % 3 === 0 ? 5 : 6;
    await submitLevel4(pin, {
      participantId: id,
      participantName: name,
      matches: l4Matches,
      score: l4Score,
      submittedAt: Date.now() - idx * 3000
    });
  }

  session.updatedAt = Date.now();
  saveToDisk();
  await syncToKV(pin, session);
  return session;
}
