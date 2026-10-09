'use client';

import React, { useState, useEffect } from 'react';
import { MEDICO_CASES, MEDICO_CAUSAS, MEDICO_SOLUCIONES } from '@/lib/data';
import { MedicoOption } from '@/lib/types';
import { Stethoscope, Pill, CheckCircle2, RotateCcw, Send, Award, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Nivel3ParticipantProps {
  pin: string;
  participantId: string;
  participantName: string;
  onSubmitted?: () => void;
}

export const Nivel3Participant: React.FC<Nivel3ParticipantProps> = ({
  pin,
  participantId,
  participantName,
  onSubmitted
}) => {
  const [shuffledCausas, setShuffledCausas] = useState<MedicoOption[]>([]);
  const [shuffledSoluciones, setShuffledSoluciones] = useState<MedicoOption[]>([]);
  // userAnswers: caseId -> { causaId, solucionId }
  const [answers, setAnswers] = useState<Record<number, { causaId?: string; solucionId?: string }>>({
    1: {},
    2: {},
    3: {}
  });
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const shuffleOptions = () => {
    setShuffledCausas([...MEDICO_CAUSAS].sort(() => Math.random() - 0.5));
    setShuffledSoluciones([...MEDICO_SOLUCIONES].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    shuffleOptions();
  }, []);

  const handleSelect = (caseId: number, type: 'causaId' | 'solucionId', valId: string) => {
    if (isChecked) return;
    setAnswers((prev) => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        [type]: valId
      }
    }));
  };

  const isAllFilled = [1, 2, 3].every((id) => answers[id]?.causaId && answers[id]?.solucionId);

  const handleCheck = async () => {
    if (!isAllFilled) return;

    let computedScore = 0;
    MEDICO_CASES.forEach((c) => {
      const userAns = answers[c.id];
      if (userAns?.causaId === c.correctCausaId) computedScore++;
      if (userAns?.solucionId === c.correctSolucionId) computedScore++;
    });

    setScore(computedScore);
    setIsChecked(true);

    if (computedScore === 6) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          level: 3,
          participantId,
          participantName,
          data: {
            answers,
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
    setAnswers({ 1: {}, 2: {}, 3: {} });
    setIsChecked(false);
    setScore(0);
    shuffleOptions();
  };

  const getScoreMessage = (s: number) => {
    if (s === 6) return '¡Diagnóstico perfecto! Sabes arreglar una IA sin cambiar de modelo.';
    if (s >= 4) return '¡Muy bien! Revisa el fallo: la solución casi siempre es darle datos o medir, no cambiar de modelo.';
    return 'Repasa la regla: si inventa, dale tus datos; si no cita, dale el documento; si no lo has medido, pruébalo. Inténtalo de nuevo.';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/70 border border-teal-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400 bg-teal-950/90 px-3.5 py-1 rounded-full border border-teal-800">
          Nivel 3 · Médico IA
        </span>
        <h2 className="text-3xl font-black text-white mt-3">Diagnóstico y Receta de Fallos en IA</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
          Aprende a solucionar fallos típicos (alucinación, falta de contexto y falta de medición) sin caer en la trampa de “cambiar de modelo”.
        </p>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {MEDICO_CASES.map((c) => {
          const userAns = answers[c.id] || {};
          const isCausaCorrect = userAns.causaId === c.correctCausaId;
          const isSolucionCorrect = userAns.solucionId === c.correctSolucionId;

          const chosenCausaOpt = MEDICO_CAUSAS.find((opt) => opt.id === userAns.causaId);
          const correctCausaOpt = MEDICO_CAUSAS.find((opt) => opt.id === c.correctCausaId);

          const chosenSolOpt = MEDICO_SOLUCIONES.find((opt) => opt.id === userAns.solucionId);
          const correctSolOpt = MEDICO_SOLUCIONES.find((opt) => opt.id === c.correctSolucionId);

          // Get picked causas and soluciones in other cases
          const pickedCausasElsewhere = Object.entries(answers)
            .filter(([k]) => Number(k) !== c.id)
            .map(([, v]) => v.causaId);

          const pickedSolucionesElsewhere = Object.entries(answers)
            .filter(([k]) => Number(k) !== c.id)
            .map(([, v]) => v.solucionId);

          return (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xl font-extrabold text-white">{c.title}</h3>
                <p className="text-sm text-teal-300 mt-1 italic">{c.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Causa Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-amber-400" />
                      🩺 Causa: ¿por qué falla?
                    </span>
                    {isChecked && (
                      <span
                        className={`text-xs font-black ${
                          isCausaCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isCausaCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                      </span>
                    )}
                  </label>

                  <select
                    value={userAns.causaId || ''}
                    disabled={isChecked}
                    onChange={(e) => handleSelect(c.id, 'causaId', e.target.value)}
                    className={`w-full p-3.5 rounded-xl text-xs font-medium border transition-all ${
                      isChecked
                        ? isCausaCorrect
                          ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold'
                          : 'bg-red-950/80 text-red-200 border-red-500 font-bold'
                        : userAns.causaId
                        ? 'bg-amber-950/70 text-amber-200 border-amber-500/60'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <option value="" disabled>
                      -- Selecciona Causa --
                    </option>
                    {shuffledCausas.map((opt) => {
                      const isDisabled = pickedCausasElsewhere.includes(opt.id);
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

                  {/* Explanation if wrong */}
                  {isChecked && !isCausaCorrect && (
                    <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-xl text-xs space-y-1 text-red-200">
                      <p className="font-bold">
                        Causa Correcta:{' '}
                        <span className="text-emerald-300">{correctCausaOpt?.text}</span>
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {chosenCausaOpt?.explanationIfWrong || correctCausaOpt?.explanationIfWrong}
                      </p>
                    </div>
                  )}
                </div>

                {/* Solucion Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-teal-400" />
                      💊 Solución: ¿qué ajusto?
                    </span>
                    {isChecked && (
                      <span
                        className={`text-xs font-black ${
                          isSolucionCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isSolucionCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                      </span>
                    )}
                  </label>

                  <select
                    value={userAns.solucionId || ''}
                    disabled={isChecked}
                    onChange={(e) => handleSelect(c.id, 'solucionId', e.target.value)}
                    className={`w-full p-3.5 rounded-xl text-xs font-medium border transition-all ${
                      isChecked
                        ? isSolucionCorrect
                          ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold'
                          : 'bg-red-950/80 text-red-200 border-red-500 font-bold'
                        : userAns.solucionId
                        ? 'bg-teal-950/70 text-teal-200 border-teal-500/60'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <option value="" disabled>
                      -- Selecciona Solución --
                    </option>
                    {shuffledSoluciones.map((opt) => {
                      const isDisabled = pickedSolucionesElsewhere.includes(opt.id);
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

                  {/* Explanation if wrong */}
                  {isChecked && !isSolucionCorrect && (
                    <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-xl text-xs space-y-1 text-red-200">
                      <p className="font-bold">
                        Solución Correcta:{' '}
                        <span className="text-emerald-300">{correctSolOpt?.text}</span>
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {chosenSolOpt?.explanationIfWrong || correctSolOpt?.explanationIfWrong}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Footer */}
      {isChecked ? (
        <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center gap-2 bg-teal-950 text-teal-300 px-4 py-1.5 rounded-full border border-teal-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Resultado del Diagnóstico Médico
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
              Reintentar Diagnóstico
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <span className="text-xs font-semibold text-slate-400">
            {isAllFilled ? '¡Las 6 casillas están completas!' : 'Completa las 6 casillas para diagnosticar'}
          </span>

          <button
            onClick={handleCheck}
            disabled={!isAllFilled}
            className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 shadow-lg ${
              isAllFilled
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-teal-950 scale-[1.02]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Comprobar Médico IA
          </button>
        </div>
      )}
    </div>
  );
};
