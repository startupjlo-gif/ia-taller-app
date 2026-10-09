import { Level1Answers, Level1Result, ProfileKey } from './types';

export function calculateLevel1Result(
  participantId: string,
  participantName: string,
  answers: Level1Answers
): Level1Result {
  const warnings: string[] = [];
  let overrideApplied: string | undefined = undefined;
  let forcedWinner: ProfileKey | undefined = undefined;

  const { q1, q2, q3, q4, q5, q6 } = answers;

  // Step 1: Override rules (Paso 1 · Reglas que deciden directamente)
  if (q2 === 'D' && q6 === 'C') {
    forcedWinner = 'opensource';
    overrideApplied = 'Modelo open source en local o en servidor propio (Datos no pueden salir + equipo técnico avanzado).';
  } else if (q2 === 'D' && (q6 === 'A' || q6 === 'B')) {
    forcedWinner = 'opensource';
    overrideApplied = 'Modelo local con acompañamiento técnico (Aviso: Necesitas un socio o perfil técnico para mantenerlo).';
  } else if (q2 === 'C') {
    overrideApplied = 'Como mínimo API de pago con datos en la UE o open source en nube europea; nunca planes gratuitos.';
  }

  if (q5 === 'C') {
    const extra = 'Añadir siempre revisión humana a cualquier recomendación debido a consecuencias graves por error.';
    overrideApplied = overrideApplied ? `${overrideApplied} | ${extra}` : extra;
  }

  // Step 2: Scoring matrix (Paso 2 · Puntuación hacia cuatro perfiles)
  const scores: Record<ProfileKey, number> = {
    rapido: 0,
    comercial: 0,
    multimodal: 0,
    opensource: 0
  };

  // Q1 - Tarea
  if (q1 === 'A') {
    scores.rapido += 3;
    scores.opensource += 1;
  } else if (q1 === 'B') {
    scores.rapido += 1;
    scores.comercial += 2;
  } else if (q1 === 'C') {
    scores.comercial += 3;
  } else if (q1 === 'D') {
    scores.comercial += 1;
    scores.multimodal += 3;
  }

  // Q2 - Datos
  if (q2 === 'A') {
    scores.rapido += 1;
    scores.comercial += 1;
  } else if (q2 === 'B') {
    scores.comercial += 1;
    scores.multimodal += 1;
    scores.opensource += 1;
  } else if (q2 === 'C') {
    scores.opensource += 2;
  } else if (q2 === 'D') {
    scores.opensource += 3;
  }

  // Q3 - Frecuencia / Coste
  if (q3 === 'A') {
    scores.comercial += 2;
    scores.multimodal += 1;
  } else if (q3 === 'B') {
    scores.rapido += 2;
    scores.opensource += 1;
  } else if (q3 === 'C') {
    scores.rapido += 3;
    scores.opensource += 2;
  }

  // Q4 - Latencia
  if (q4 === 'A') {
    scores.rapido += 2;
  } else if (q4 === 'C') {
    scores.comercial += 1;
    scores.multimodal += 1;
  }

  // Q5 - Consecuencia error
  if (q5 === 'A') {
    scores.rapido += 2;
  } else if (q5 === 'C') {
    scores.comercial += 2;
  }

  // Q6 - Capacidad técnica
  if (q6 === 'C') {
    scores.opensource += 2;
  }

  // Sort profiles by score
  const sortedProfiles = (Object.keys(scores) as ProfileKey[]).sort(
    (a, b) => scores[b] - scores[a]
  );

  const winnerProfile: ProfileKey = forcedWinner || sortedProfiles[0];
  const secondProfile: ProfileKey | undefined =
    sortedProfiles.find((p) => p !== winnerProfile) || sortedProfiles[1];

  // Automatic warnings (Matices)
  if (q2 === 'C' || q2 === 'D') {
    warnings.push('🔒 No uses planes gratuitos: pueden usar tus datos para mejorar sus servicios.');
  }

  if (q5 === 'C') {
    warnings.push('⚠️ Diseña con revisión humana y revisa si tu caso es de alto riesgo según el AI Act.');
  }

  if (q3 === 'C' && winnerProfile === 'comercial') {
    warnings.push('💡 Con este volumen, compara el coste con un modelo pequeño antes de decidir.');
  }

  if (q6 === 'A' && winnerProfile === 'opensource') {
    warnings.push('🛠️ Necesitarás un socio técnico para mantener este modelo.');
  }

  return {
    participantId,
    participantName,
    answers,
    winnerProfile,
    secondProfile,
    overrideApplied,
    warnings,
    submittedAt: Date.now()
  };
}
