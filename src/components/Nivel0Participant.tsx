'use client';

import React, { useState, useEffect } from 'react';
import { LEVEL0_CONCEPTS } from '@/lib/data';
import { CheckCircle2, XCircle, RotateCcw, Send, HelpCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Nivel0ParticipantProps {
  pin: string;
  participantId: string;
  participantName: string;
  onSubmitted?: () => void;
}

export const Nivel0Participant: React.FC<Nivel0ParticipantProps> = ({
  pin,
  participantId,
  participantName,
  onSubmitted
}) => {
  const [shuffledDefinitions, setShuffledDefinitions] = useState<{ id: string; definition: string }[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  // matches: conceptId -> definitionId
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const shuffleAll = () => {
    const defs = LEVEL0_CONCEPTS.map((c) => ({ id: c.id, definition: c.definition }));
    const shuffled = [...defs].sort(() => Math.random() - 0.5);
    setShuffledDefinitions(shuffled);
  };

  useEffect(() => {
    shuffleAll();
  }, []);

  const getConceptForDefinition = (defId: string) => {
    return Object.keys(matches).find((cId) => matches[cId] === defId);
  };

  const handleConceptClick = (conceptId: string) => {
    if (submitted) return;
    if (selectedConceptId === conceptId) {
      setSelectedConceptId(null);
    } else {
      setSelectedConceptId(conceptId);
    }
  };

  const handleDefinitionClick = (defId: string) => {
    if (submitted) return;
    if (!selectedConceptId) {
      const existingConcept = getConceptForDefinition(defId);
      if (existingConcept) {
        const updated = { ...matches };
        delete updated[existingConcept];
        setMatches(updated);
      }
      return;
    }

    const updated = { ...matches, [selectedConceptId]: defId };
    setMatches(updated);
    setSelectedConceptId(null);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedConceptId(null);
    setSubmitted(false);
    setScore(0);
    shuffleAll();
  };

  const handleSubmit = async () => {
    if (Object.keys(matches).length < LEVEL0_CONCEPTS.length) return;
    setIsSubmitting(true);

    let computedScore = 0;
    LEVEL0_CONCEPTS.forEach((c) => {
      if (matches[c.id] === c.id) {
        computedScore++;
      }
    });

    setScore(computedScore);

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          level: 0,
          participantId,
          participantName,
          data: { matches }
        })
      });

      setSubmitted(true);
      if (computedScore >= 5) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = Object.keys(matches).length === LEVEL0_CONCEPTS.length;

  const getScoreMessage = (s: number) => {
    if (s === 7) return '¡Excelente! Has emparejado perfectamente todos los conceptos básicos de IA.';
    if (s >= 5) return '¡Muy bien! Revisa las parejas marcadas en rojo para afianzar el vocabulario.';
    return 'Repasa los conceptos clave: la ventana de contexto es la memoria, el token es la moneda y la alucinación es la respuesta inventada. ¡Inténtalo de nuevo!';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
          Nivel 0 · Midiendo Conceptos
        </span>
        <h2 className="text-2xl font-black text-white mt-3">Dinámica de Emparejamiento</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto">
          Toca primero un <strong className="text-indigo-300">Concepto</strong> y luego su{' '}
          <strong className="text-purple-300">Explicación</strong> correcta para unirlos.
        </p>
      </div>

      {/* Matching Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Concepts */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            1. Concepto ({Object.keys(matches).length}/7)
          </h3>
          {LEVEL0_CONCEPTS.map((c) => {
            const isSelected = selectedConceptId === c.id;
            const isMatched = !!matches[c.id];
            const isCorrect = matches[c.id] === c.id;

            return (
              <button
                key={c.id}
                onClick={() => handleConceptClick(c.id)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-xl font-medium transition-all duration-200 border relative flex items-center justify-between ${
                  submitted
                    ? isCorrect
                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/60 shadow-sm'
                      : 'bg-red-950/60 text-red-200 border-red-500/60 shadow-sm'
                    : isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg scale-[1.02]'
                    : isMatched
                    ? 'bg-indigo-950/60 text-indigo-200 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-900/80 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-700/50">
                    {c.concept.substring(0, 2)}
                  </span>
                  <span className="font-semibold text-base">{c.concept}</span>
                </div>
                {isMatched && !submitted && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                )}
                {submitted && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {submitted && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Definitions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            2. Explicación
          </h3>
          {shuffledDefinitions.map((d) => {
            const matchedConceptId = getConceptForDefinition(d.id);
            const matchedConcept = matchedConceptId
              ? LEVEL0_CONCEPTS.find((c) => c.id === matchedConceptId)
              : null;

            const isCorrectMatch = matchedConceptId === d.id;

            return (
              <button
                key={d.id}
                onClick={() => handleDefinitionClick(d.id)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 border relative flex flex-col justify-between ${
                  submitted && matchedConcept
                    ? isCorrectMatch
                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/60'
                      : 'bg-red-950/60 text-red-200 border-red-500/60'
                    : matchedConcept
                    ? 'bg-purple-950/60 text-purple-200 border-purple-500/50 shadow-sm'
                    : selectedConceptId
                    ? 'bg-slate-800/90 hover:bg-purple-900/40 text-slate-200 border-purple-500/40 hover:border-purple-400 animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <p className="text-sm leading-relaxed">{d.definition}</p>
                {matchedConcept && (
                  <div className="mt-2 text-xs font-semibold flex items-center justify-between pt-2 border-t border-purple-800/40">
                    <span>
                      Pareja con: <strong>{matchedConcept.concept}</strong>
                    </span>
                    {!submitted && (
                      <span className="text-[10px] text-purple-400 underline">Toca para cambiar</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Card on Submitted */}
      {submitted ? (
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-950 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Resultado del Emparejamiento
          </div>

          <h3 className="text-3xl font-black text-white">
            Puntuación: <span className="text-emerald-400">{score}</span> / 7
          </h3>

          <p className="text-base text-slate-200 font-medium max-w-xl mx-auto">
            {getScoreMessage(score)}
          </p>

          {/* Correction breakdown for mistakes */}
          {score < 7 && (
            <div className="text-left bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 mt-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Corrección de Parejas Erróneas:
              </span>
              <div className="space-y-2 text-xs">
                {LEVEL0_CONCEPTS.filter((c) => matches[c.id] !== c.id).map((c) => {
                  const userChosenDefId = matches[c.id];
                  const userChosenDef = LEVEL0_CONCEPTS.find((item) => item.id === userChosenDefId);

                  return (
                    <div
                      key={c.id}
                      className="bg-red-950/30 border border-red-800/30 p-3 rounded-xl space-y-1 text-red-200"
                    >
                      <span className="font-bold text-white block">
                        Concepto: {c.concept}
                      </span>
                      {userChosenDef && (
                        <p className="text-slate-400">
                          Tu elección: <span className="line-through">{userChosenDef.definition}</span>
                        </p>
                      )}
                      <p className="text-emerald-300 font-semibold">
                        Correcta: {c.definition}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 inline-flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar Emparejamiento
            </button>
          </div>
        </div>
      ) : (
        /* Action Footer */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar parejas
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
              isComplete
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/50 scale-[1.02]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviar Parejas ({Object.keys(matches).length}/7)
          </button>
        </div>
      )}
    </div>
  );
};
