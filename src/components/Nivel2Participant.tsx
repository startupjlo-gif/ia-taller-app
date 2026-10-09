'use client';

import React, { useState, useEffect } from 'react';
import { LEVEL2_CASES, LEVEL2_CONCEPTS } from '@/lib/data';
import { Level2CaseAnswer, SlotOption } from '@/lib/types';
import { CheckCircle2, XCircle, RotateCcw, Zap, Brain, Target, Award, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Nivel2ParticipantProps {
  pin: string;
  participantId: string;
  participantName: string;
  onSubmitted?: () => void;
}

export const Nivel2Participant: React.FC<Nivel2ParticipantProps> = ({
  pin,
  participantId,
  participantName,
  onSubmitted
}) => {
  // Store shuffled options per case
  const [shuffledOptions, setShuffledOptions] = useState<Record<number, SlotOption[]>>({});
  // User selections: caseId -> { disparador, cerebro, accion }
  const [userSelections, setUserSelections] = useState<Record<number, Partial<Level2CaseAnswer>>>({
    1: {},
    2: {},
    3: {}
  });
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Shuffle options on initial mount
  const shuffleAll = () => {
    const shuffled: Record<number, SlotOption[]> = {};
    LEVEL2_CASES.forEach((c) => {
      shuffled[c.id] = [...c.options].sort(() => Math.random() - 0.5);
    });
    setShuffledOptions(shuffled);
  };

  useEffect(() => {
    shuffleAll();
  }, []);

  const handleSelectSlot = (
    caseId: number,
    slot: 'disparador' | 'cerebro' | 'accion',
    optionId: string
  ) => {
    if (isChecked) return;
    setUserSelections((prev) => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        [slot]: optionId
      }
    }));
  };

  // Check if 9 boxes are complete
  const isAllFilled = [1, 2, 3].every((caseId) => {
    const sel = userSelections[caseId];
    return sel && sel.disparador && sel.cerebro && sel.accion;
  });

  const handleCheck = async () => {
    if (!isAllFilled) return;

    let computedScore = 0;
    LEVEL2_CASES.forEach((c) => {
      const sel = userSelections[c.id];
      if (sel.disparador === c.correct.disparador) computedScore++;
      if (sel.cerebro === c.correct.cerebro) computedScore++;
      if (sel.accion === c.correct.accion) computedScore++;
    });

    setScore(computedScore);
    setIsChecked(true);

    if (computedScore === 9) {
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    }

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          level: 2,
          participantId,
          participantName,
          data: {
            cases: userSelections as Record<number, Level2CaseAnswer>,
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
    setUserSelections({ 1: {}, 2: {}, 3: {} });
    setIsChecked(false);
    setScore(0);
    shuffleAll();
  };

  const getScoreMessage = (s: number) => {
    if (s === 9) {
      return '¡Perfecto! Ya sabes leer cualquier automatización. Ahora piensa cuál sería la tuya.';
    }
    if (s >= 6) {
      return '¡Muy bien! Revisa las que fallaste: casi siempre la confusión está entre la fuente de datos y el disparador.';
    }
    return 'Repasa la regla: ¿qué lo arranca?, ¿qué piensa?, ¿qué cambia al final? Inténtalo de nuevo.';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/90 px-3.5 py-1 rounded-full border border-purple-800">
          Nivel 2 · Arma tu automatización
        </span>
        <h2 className="text-3xl font-black text-white mt-3">Construcción de Flujos con IA</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
          Identifica las 3 piezas fundamentales de cada flujo: Disparador ⚡, Cerebro 🧠 y Acción 🎯.
        </p>

        {/* 3 Key Concepts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
          {LEVEL2_CONCEPTS.map((c, i) => (
            <div
              key={i}
              className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.symbol}</span>
                <span className="font-extrabold text-sm text-white">{c.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">{c.definition}</p>
              <span className="text-[11px] font-semibold text-purple-300 block pt-1">
                {c.question}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-8">
        {LEVEL2_CASES.map((c) => {
          const options = shuffledOptions[c.id] || c.options;
          const caseSel = userSelections[c.id] || {};

          return (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xl font-extrabold text-white">{c.title}</h3>
                <p className="text-sm text-indigo-300 mt-1 italic">{c.description}</p>
              </div>

              {/* 3 Slots */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['disparador', 'cerebro', 'accion'] as const).map((slotKey) => {
                  const slotLabel =
                    slotKey === 'disparador'
                      ? '⚡ Disparador'
                      : slotKey === 'cerebro'
                      ? '🧠 Cerebro'
                      : '🎯 Acción';

                  const selectedOptId = caseSel[slotKey];
                  const selectedOpt = options.find((o) => o.id === selectedOptId);
                  const isCorrect = selectedOptId === c.correct[slotKey];
                  const correctOpt = options.find((o) => o.id === c.correct[slotKey]);

                  // Used options in this case (other slots)
                  const usedInOtherSlots = Object.entries(caseSel)
                    .filter(([k]) => k !== slotKey)
                    .map(([, val]) => val);

                  return (
                    <div key={slotKey} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>{slotLabel}</span>
                        {isChecked && (
                          <span
                            className={`text-xs font-black ${
                              isCorrect ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                          </span>
                        )}
                      </label>

                      {/* Dropdown Select */}
                      <select
                        value={selectedOptId || ''}
                        disabled={isChecked}
                        onChange={(e) => handleSelectSlot(c.id, slotKey, e.target.value)}
                        className={`w-full p-3 rounded-xl text-xs font-medium border transition-all ${
                          isChecked
                            ? isCorrect
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold'
                              : 'bg-red-950/80 text-red-200 border-red-500 font-bold'
                            : selectedOptId
                            ? 'bg-indigo-950 text-indigo-200 border-indigo-500'
                            : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <option value="" disabled>
                          -- Selecciona opción --
                        </option>
                        {options.map((opt) => {
                          const isUsedElsewhere = usedInOtherSlots.includes(opt.id);
                          return (
                            <option
                              key={opt.id}
                              value={opt.id}
                              disabled={isUsedElsewhere}
                              className="bg-slate-900 text-slate-200"
                            >
                              {opt.text}
                            </option>
                          );
                        })}
                      </select>

                      {/* Explanation if wrong when checked */}
                      {isChecked && !isCorrect && (
                        <div className="bg-red-950/40 border border-red-800/40 p-2.5 rounded-xl text-xs space-y-1 text-red-200">
                          <p className="font-semibold">
                            Correcto:{' '}
                            <span className="text-emerald-300">{correctOpt?.text}</span>
                          </p>
                          <p className="text-[11px] text-slate-300">{correctOpt?.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Card or Submit Footer */}
      {isChecked ? (
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-950 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Resultado Obtenido
          </div>

          <h3 className="text-3xl font-black text-white">
            Puntuación: <span className="text-emerald-400">{score}</span> / 9
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
              Reintentar Actividad
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <span className="text-xs font-semibold text-slate-400">
            {isAllFilled ? '¡Todas las casillas completas!' : 'Completa las 9 casillas para evaluar'}
          </span>

          <button
            onClick={handleCheck}
            disabled={!isAllFilled}
            className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 shadow-lg ${
              isAllFilled
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950 scale-[1.02]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Comprobar Respuestas
          </button>
        </div>
      )}
    </div>
  );
};
