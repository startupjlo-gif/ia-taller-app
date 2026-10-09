export type LevelId = 0 | 1 | 2 | 3 | 4;

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
}

// LEVEL 0 TYPES
export interface ConceptPair {
  id: string;
  concept: string;
  definition: string;
}

export interface Level0Answer {
  participantId: string;
  participantName: string;
  // map conceptId -> chosenDefinitionId
  matches: Record<string, string>;
  submittedAt: number;
}

// LEVEL 1 TYPES (Diagnóstico de modelo)
export interface QuestionOption {
  value: 'A' | 'B' | 'C' | 'D';
  label: string;
}

export interface Question {
  id: number;
  variable: string;
  title: string;
  options: QuestionOption[];
}

export type ProfileKey = 'rapido' | 'comercial' | 'multimodal' | 'opensource';

export interface ProfileDetail {
  key: ProfileKey;
  title: string;
  badgeColor: string;
  borderColor: string;
  bgGradient: string;
  elige: string;
  ejemplos: string;
  porQue: string;
  ojo: string;
  siguientePaso: string;
}

export interface Level1Answers {
  q1: 'A' | 'B' | 'C' | 'D';
  q2: 'A' | 'B' | 'C' | 'D';
  q3: 'A' | 'B' | 'C' | 'D';
  q4: 'A' | 'B' | 'C' | 'D';
  q5: 'A' | 'B' | 'C' | 'D';
  q6: 'A' | 'B' | 'C' | 'D';
}

export interface Level1Result {
  participantId: string;
  participantName: string;
  answers: Level1Answers;
  winnerProfile: ProfileKey;
  secondProfile?: ProfileKey;
  overrideApplied?: string;
  warnings: string[];
  submittedAt: number;
}

// LEVEL 2 TYPES (Arma tu automatización)
export interface SlotOption {
  id: string;
  text: string;
  type: 'Disparador' | 'Cerebro' | 'Acción' | 'Trampa';
  targetSlot?: 'disparador' | 'cerebro' | 'accion';
  explanation: string;
}

export interface AutomationCase {
  id: number;
  title: string;
  description: string;
  options: SlotOption[];
  correct: {
    disparador: string;
    cerebro: string;
    accion: string;
  };
}

export interface Level2CaseAnswer {
  disparador: string;
  cerebro: string;
  accion: string;
}

export interface Level2Submission {
  participantId: string;
  participantName: string;
  cases: Record<number, Level2CaseAnswer>;
  score: number; // out of 9
  submittedAt: number;
}

// LEVEL 3 TYPES (Médico IA)
export interface MedicoOption {
  id: string;
  text: string;
  correctCaseId?: number;
  explanationIfWrong: string;
}

export interface MedicoCase {
  id: number;
  title: string;
  description: string;
  correctCausaId: string;
  correctSolucionId: string;
}

export interface Level3Submission {
  participantId: string;
  participantName: string;
  answers: Record<number, { causaId: string; solucionId: string }>;
  score: number; // out of 6
  submittedAt: number;
}

// LEVEL 4 TYPES (Agentes e Industriales)
export interface AgentConcept {
  id: string;
  concept: string;
  correctMeaningId: string;
  caseExample: string;
}

export interface MeaningOption {
  id: string;
  text: string;
  isTrap?: boolean;
  trapReason?: string;
}

export interface Level4Submission {
  participantId: string;
  participantName: string;
  matches: Record<string, string>; // conceptId -> meaningId
  score: number; // out of 6
  submittedAt: number;
}

// CONSOLIDATED SESSION DATA
export interface SessionData {
  pin: string;
  activeLevel: LevelId;
  participants: Participant[];
  level0Answers: Level0Answer[];
  level1Results: Level1Result[];
  level2Submissions: Level2Submission[];
  level3Submissions: Level3Submission[];
  level4Submissions: Level4Submission[];
  updatedAt: number;
}
