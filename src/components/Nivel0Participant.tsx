'use client';

import React, { useState, useEffect } from 'react';
import { LEVEL0_CONCEPTS } from '@/lib/data';
import { CheckCircle2, XCircle, RotateCcw, Send, HelpCircle, Award, Sparkles, SlidersHorizontal } from 'lucide-react';
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

  const handleSelectDefinition = (conceptId: string, defId: string) => {
    if (submitted) return;
    setMatches((prev) => ({
      ...prev,
      [conceptId]: defId
    }));
  };

  const handleReset = () => {
    setMatches({});
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

  const matchedCount = Object.keys(matches).length;
  const isComplete = matchedCount === LEVEL0_CONCEPTS.length;

  const getScoreMessage = (s: number) => {
    if (s === 7) return '¡Excelente! Has emparejado perfectamente todos los conceptos básicos de IA.';
    if (s >= 5) return '¡Muy bien! Revisa las parejas marcadas en rojo para afianzar el vocabulario.';
    return 'Repasa los conceptos clave: la ventana de contexto es la memoria, el token es la moneda y la alucinación es la respuesta inventada. ¡Inténtalo de nuevo!';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-sm text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-950/90 px-3 py-1 rounded-full border border-indigo-800/60">
          Nivel 0 · Midiendo Conceptos
        </span>
        <h2 className="text-2xl font-black text-white mt-2">Emparejamiento de Conceptos</h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">
          Selecciona la explicación correcta para cada uno de los 7 conceptos fundamentales de IA.
        </p>

        {/* Progress Badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-indigo-300">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Progreso: {matchedCount} de 7 emparejados</span>
        </div>
      </div>

      {/* Concept Cards with Touch-Friendly Dropdowns */}
      <div className="space-y-4">
        {LEVEL0_CONCEPTS.map((c, index) => {
          const selectedDefId = matches[c.id];
          const isCorrect = selectedDefId === c.id;
          const chosenDef = shuffledDefinitions.find((d) => d.id === selectedDefId);
          const correctDef = LEVEL0_CONCEPTS.find((item) => item.id === c.id);

          // Get definitions picked in other concepts (to prevent duplicate selection)
          const pickedElsewhere = Object.entries(matches)
            .filter(([k]) => k !== c.id)
            .map(([, v]) => v);

          return (
            <div
              key={c.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3 ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-red-500/60 bg-red-950/20'
                  : selectedDefId
                  ? 'border-indigo-500/50 bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Concept Name & Status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold text-xs flex items-center justify-center border border-indigo-800 flex-shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">{c.concept}</h3>
                </div>

                {submitted && (
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrecto
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Touch-Friendly Select Dropdown */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Explicación asignada:
                </label>

                <select
                  value={selectedDefId || ''}
                  disabled={submitted}
                  onChange={(e) => handleSelectDefinition(c.id, e.target.value)}
                  className={`w-full p-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all appearance-none cursor-pointer ${
                    submitted
                      ? isCorrect
                        ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold'
                        : 'bg-red-950/80 text-red-200 border-red-500 font-bold'
                      : selectedDefId
                      ? 'bg-indigo-950 text-indigo-200 border-indigo-500 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <option value="" disabled>
                    -- Toca aquí para elegir la explicación --
                  </option>
                  {shuffledDefinitions.map((d) => {
                    const isDisabled = pickedElsewhere.includes(d.id);
                    return (
                      <option
                        key={d.id}
                        value={d.id}
                        disabled={isDisabled}
                        className="bg-slate-900 text-slate-200 p-2"
                      >
                        {d.definition} {isDisabled ? ' (ya usada)' : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Display selected text clearly on mobile */}
                {selectedDefId && chosenDef && !submitted && (
                  <div className="bg-indigo-950/40 border border-indigo-800/40 p-2.5 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-snug">{chosenDef.definition}</p>
                  </div>
                )}

                {/* Correction breakdown when submitted and wrong */}
                {submitted && !isCorrect && (
                  <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-xl text-xs space-y-1 text-red-200 mt-2">
                    {chosenDef && (
                      <p className="text-slate-400">
                        Tu elección: <span className="line-through">{chosenDef.definition}</span>
                      </p>
                    )}
                    <p className="font-bold text-emerald-300">
                      Explicación correcta: {correctDef?.definition}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Card or Submit Button */}
      {submitted ? (
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-950 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Resultado de Emparejamiento Nivel 0
          </div>

          <h3 className="text-3xl font-black text-white">
            Puntuación: <span className="text-emerald-400">{score}</span> / 7
          </h3>

          <p className="text-sm text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            {getScoreMessage(score)}
          </p>

          <div className="pt-3 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 inline-flex items-center gap-2 transition-all shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar Emparejamiento
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl sticky bottom-4">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
              isComplete
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-950 scale-[1.02]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviar Parejas ({matchedCount}/7)
          </button>
        </div>
      )}
    </div>
  );
};
