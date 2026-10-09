'use client';

import React, { useState, useEffect } from 'react';
import { AGENT_CONCEPTS, MEANING_OPTIONS } from '@/lib/data';
import { MeaningOption } from '@/lib/types';
import { CheckCircle2, RotateCcw, Send, Award, Bot, HelpCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Nivel4ParticipantProps {
  pin: string;
  participantId: string;
  participantName: string;
  onSubmitted?: () => void;
}

export const Nivel4Participant: React.FC<Nivel4ParticipantProps> = ({
  pin,
  participantId,
  participantName,
  onSubmitted
}) => {
  const [shuffledMeanings, setShuffledMeanings] = useState<MeaningOption[]>([]);
  // matches: conceptId -> meaningId
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const shuffleMeanings = () => {
    setShuffledMeanings([...MEANING_OPTIONS].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    shuffleMeanings();
  }, []);

  const handleSelectMeaning = (conceptId: string, meaningId: string) => {
    if (isChecked) return;
    setMatches((prev) => ({
      ...prev,
      [conceptId]: meaningId
    }));
  };

  const isAllAnswered = AGENT_CONCEPTS.every((c) => matches[c.id]);

  const handleCheck = async () => {
    if (!isAllAnswered) return;

    let computedScore = 0;
    AGENT_CONCEPTS.forEach((c) => {
      if (matches[c.id] === c.correctMeaningId) computedScore++;
    });

    setScore(computedScore);
    setIsChecked(true);

    if (computedScore === 6) {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
    }

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          level: 4,
          participantId,
          participantName,
          data: {
            matches,
            score: computedScore
          }
        })
      });
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleRetry = () => {
    setMatches({});
    setIsChecked(false);
    setScore(0);
    shuffleMeanings();
  };

  const getScoreMessage = (s: number) => {
    if (s === 6) return '¡Perfecto! Dominas los conceptos de agentes y de predicción.';
    if (s >= 4) return '¡Bien! Revisa los fallos: la mayoría vienen de confundir lo que hace la IA con lo que la conecta o la ataca.';
    return 'Repasa: el agente actúa, MCP lo conecta, la inyección lo ataca; los datos históricos entrenan un modelo predictivo que anticipa averías.';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 bg-blue-950/90 px-3.5 py-1 rounded-full border border-blue-800">
          Nivel 4 · Agentes Autónomos e Industriales
        </span>
        <h2 className="text-3xl font-black text-white mt-3">Emparejamiento de Conceptos Clave</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
          Relaciona los 6 conceptos avanzados de agentes y machine learning con su significado correcto y con los casos prácticos del taller.
        </p>
      </div>

      {/* Concept Match List */}
      <div className="space-y-4">
        {AGENT_CONCEPTS.map((c) => {
          const selectedMeaningId = matches[c.id];
          const isCorrect = selectedMeaningId === c.correctMeaningId;

          const chosenMeaningOpt = MEANING_OPTIONS.find((m) => m.id === selectedMeaningId);
          const correctMeaningOpt = MEANING_OPTIONS.find((m) => m.id === c.correctMeaningId);

          const pickedElsewhere = Object.entries(matches)
            .filter(([k]) => k !== c.id)
            .map(([, v]) => v);

          return (
            <div
              key={c.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all space-y-3 ${
                isChecked
                  ? isCorrect
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-red-500/50 bg-red-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 font-extrabold text-sm flex items-center justify-center border border-blue-800 flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{c.concept}</h3>
                </div>

                {isChecked && (
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${
                      isCorrect
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    {isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                  </span>
                )}
              </div>

              {/* Meaning Dropdown */}
              <div className="space-y-2">
                <select
                  value={selectedMeaningId || ''}
                  disabled={isChecked}
                  onChange={(e) => handleSelectMeaning(c.id, e.target.value)}
                  className={`w-full p-3.5 rounded-xl text-xs font-medium border transition-all ${
                    isChecked
                      ? isCorrect
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-500 font-bold'
                        : 'bg-red-950 text-red-200 border-red-500 font-bold'
                      : selectedMeaningId
                      ? 'bg-blue-950 text-blue-200 border-blue-500'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <option value="" disabled>
                    -- Selecciona Significado --
                  </option>
                  {shuffledMeanings.map((opt) => {
                    const isDisabled = pickedElsewhere.includes(opt.id);
                    return (
                      <option
                        key={opt.id}
                        value={opt.id}
                        disabled={isDisabled}
                        className="bg-slate-900 text-slate-200"
                      >
                        {opt.text}
                      </option>
                    );
                  })}
                </select>

                {/* Explanation and Case Example on Incorrect Check */}
                {isChecked && !isCorrect && (
                  <div className="bg-red-950/40 border border-red-800/40 p-3.5 rounded-xl text-xs space-y-2 text-red-200">
                    <p className="font-bold">
                      Significado Correcto:{' '}
                      <span className="text-emerald-300">{correctMeaningOpt?.text}</span>
                    </p>
                    {chosenMeaningOpt?.isTrap && chosenMeaningOpt.trapReason && (
                      <p className="text-amber-200 text-[11px] font-semibold">
                        Por qué no encaja: {chosenMeaningOpt.trapReason}
                      </p>
                    )}
                    <div className="pt-2 border-t border-red-900/50">
                      <span className="font-bold text-indigo-300 block uppercase tracking-wider text-[10px]">
                        Ejemplo del Caso Práctico:
                      </span>
                      <p className="text-slate-200 text-xs italic mt-0.5">{c.caseExample}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Footer */}
      {isChecked ? (
        <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-950 text-blue-300 px-4 py-1.5 rounded-full border border-blue-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Resultado de Agentes Autónomos
          </div>

          <h3 className="text-3xl font-black text-white">
            Puntuación: <span className="text-emerald-400">{score}</span> / 6
          </h3>

          <p className="text-base text-slate-200 font-medium max-w-xl mx-auto">
            {getScoreMessage(score)}
          </p>

          <div className="pt-3">
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 inline-flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar Ejercicio
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <span className="text-xs font-semibold text-slate-400">
            {isAllAnswered ? '¡Todos los conceptos asignados!' : 'Asigna los 6 conceptos para comprobar'}
          </span>

          <button
            onClick={handleCheck}
            disabled={!isAllAnswered}
            className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 shadow-lg ${
              isAllAnswered
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950 scale-[1.02]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Comprobar Conceptos
          </button>
        </div>
      )}
    </div>
  );
};
