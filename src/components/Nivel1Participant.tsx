'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS, PROFILE_DETAILS } from '@/lib/data';
import { Level1Answers, Level1Result, ProfileKey } from '@/lib/types';
import { calculateLevel1Result } from '@/lib/logic';
import {
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Nivel1ParticipantProps {
  pin: string;
  participantId: string;
  participantName: string;
  onSubmitted?: () => void;
}

export const Nivel1Participant: React.FC<Nivel1ParticipantProps> = ({
  pin,
  participantId,
  participantName,
  onSubmitted
}) => {
  const [answers, setAnswers] = useState<Partial<Level1Answers>>({});
  const [result, setResult] = useState<Level1Result | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, value: 'A' | 'B' | 'C' | 'D') => {
    const qKey = `q${questionId}` as keyof Level1Answers;
    setAnswers((prev) => ({ ...prev, [qKey]: value }));
  };

  const isFormComplete =
    answers.q1 && answers.q2 && answers.q3 && answers.q4 && answers.q5 && answers.q6;

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    setIsSubmitting(true);

    const fullAnswers = answers as Level1Answers;
    const computedResult = calculateLevel1Result(participantId, participantName, fullAnswers);

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          level: 1,
          participantId,
          participantName,
          data: { answers: fullAnswers }
        })
      });

      setResult(computedResult);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/90 px-3.5 py-1 rounded-full border border-emerald-800">
          Nivel 1 · Actividad Diagnóstico
        </span>
        <h2 className="text-3xl font-black text-white mt-3">¿Qué Modelo Elegir?</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
          Responde las 6 preguntas sobre tu proyecto. El sistema evaluará tus necesidades de{' '}
          <strong className="text-emerald-300">Calidad, Coste, Privacidad y Latencia</strong> para recomendarte la solución ideal.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Questions Grid */}
          <div className="space-y-6">
            {DIAGNOSTIC_QUESTIONS.map((q) => {
              const qKey = `q${q.id}` as keyof Level1Answers;
              const selectedValue = answers[qKey];

              return (
                <div
                  key={q.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-800">
                        {q.id}
                      </span>
                      {q.title}
                    </h3>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      {q.variable}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt) => {
                      const isSelected = selectedValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelectOption(q.id, opt.value)}
                          className={`text-left p-3.5 rounded-xl text-sm font-medium transition-all duration-150 border flex items-start justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40 scale-[1.01]'
                              : 'bg-slate-950/70 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="leading-snug">{opt.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 ml-2 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <span className="text-xs font-semibold text-slate-400">
              Progreso: {Object.keys(answers).length}/6 preguntas respondidas
            </span>

            <button
              onClick={handleSubmit}
              disabled={!isFormComplete || isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 shadow-lg ${
                isFormComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950 scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Obtener Mi Diagnóstico ({Object.keys(answers).length}/6)
            </button>
          </div>
        </div>
      ) : (
        /* Result Detail Screen */
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          {/* Winner Profile Card */}
          {(() => {
            const winner = PROFILE_DETAILS[result.winnerProfile];
            const second = result.secondProfile ? PROFILE_DETAILS[result.secondProfile] : null;

            return (
              <div
                className={`bg-gradient-to-b ${winner.bgGradient} border-2 ${winner.borderColor} rounded-3xl p-6 md:p-8 shadow-2xl space-y-6`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                      Resultado Recomendado para tu Empresa
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1">{winner.title}</h3>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${winner.badgeColor}`}
                  >
                    Perfil Recomendado
                  </span>
                </div>

                {/* Overrides or special notice */}
                {result.overrideApplied && (
                  <div className="bg-amber-950/70 border border-amber-500/40 rounded-2xl p-4 text-amber-200 text-sm flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300 font-bold uppercase text-xs">
                        Regla de Prioridad Directa Aplicada:
                      </strong>
                      <p className="mt-0.5">{result.overrideApplied}</p>
                    </div>
                  </div>
                )}

                {/* 5 Structural Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400">🎯 Qué Elegir</span>
                    <p className="text-base font-semibold text-white">{winner.elige}</p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400">🤖 Ejemplos</span>
                    <p className="text-base font-semibold text-indigo-300">{winner.ejemplos}</p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400">💡 Por Qué</span>
                    <p className="text-sm text-slate-200">{winner.porQue}</p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-xs uppercase font-bold text-amber-400">👁️ Ojo / Advertencia</span>
                    <p className="text-sm text-amber-200/90">{winner.ojo}</p>
                  </div>
                </div>

                {/* Siguiente Paso */}
                <div className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      🚀 Siguiente Paso Recomendado
                    </span>
                    <p className="text-sm font-medium text-slate-100 mt-0.5">{winner.siguientePaso}</p>
                  </div>
                </div>

                {/* Second profile alternative */}
                {second && (
                  <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>
                        Segundo perfil más votado (alternativa):{' '}
                        <strong className="text-purple-300 font-bold">{second.title}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Matices & Advertencias Automáticas:
                    </span>
                    <div className="space-y-2">
                      {result.warnings.map((warn, i) => (
                        <div
                          key={i}
                          className="bg-amber-950/40 border border-amber-800/40 px-3.5 py-2 rounded-xl text-xs text-amber-200 font-medium"
                        >
                          {warn}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir Diagnóstico
            </button>

            <div className="text-xs text-emerald-400 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Respuesta consolidada en la pantalla del formador</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
