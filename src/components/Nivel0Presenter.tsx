'use client';

import React from 'react';
import { LEVEL0_CONCEPTS } from '@/lib/data';
import { Level0Answer } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Users, Award } from 'lucide-react';

interface Nivel0PresenterProps {
  answers: Level0Answer[];
}

export const Nivel0Presenter: React.FC<Nivel0PresenterProps> = ({ answers }) => {
  const totalSubmissions = answers.length;

  // Calculate statistics per concept
  const stats = LEVEL0_CONCEPTS.map((c) => {
    let correctCount = 0;
    const choiceDistribution: Record<string, number> = {};

    answers.forEach((ans) => {
      const chosenDefId = ans.matches[c.id];
      if (chosenDefId) {
        choiceDistribution[chosenDefId] = (choiceDistribution[chosenDefId] || 0) + 1;
        if (chosenDefId === c.id) {
          correctCount++;
        }
      }
    });

    const accuracyPct = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

    return {
      concept: c,
      correctCount,
      accuracyPct,
      choiceDistribution
    };
  });

  const overallAveragePct =
    stats.reduce((acc, curr) => acc + curr.accuracyPct, 0) / (stats.length || 1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
            Proyección en Pantalla · Formador
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Nivel 0: Midiendo Conceptos
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Consolidado en vivo de las respuestas enviadas por los participantes.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Respuestas</span>
            </div>
            <span className="text-3xl font-black text-white">{totalSubmissions}</span>
          </div>

          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Award className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Precisión Global</span>
            </div>
            <span className="text-3xl font-black text-emerald-400">
              {Math.round(overallAveragePct)}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Concept Matchings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map(({ concept, correctCount, accuracyPct, choiceDistribution }) => {
          return (
            <div
              key={concept.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 font-bold text-xs border border-indigo-800">
                      Concepto
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{concept.concept}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      accuracyPct >= 80
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : accuracyPct >= 50
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    {accuracyPct}% Acierto ({correctCount}/{totalSubmissions})
                  </span>
                </div>

                <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Pareja Correcta:
                    </span>
                    <p className="text-sm font-medium text-slate-200">{concept.definition}</p>
                  </div>
                </div>
              </div>

              {/* Live Distribution Progress Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Distribución de Votos de los Participantes:
                </span>

                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${accuracyPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Correcto: ${accuracyPct}%`}
                  />
                  <div
                    style={{ width: `${100 - accuracyPct}%` }}
                    className="bg-slate-700 h-full transition-all duration-500"
                    title={`Otros: ${100 - accuracyPct}%`}
                  />
                </div>

                {/* Show details if there are misconceptions */}
                {totalSubmissions > 0 && accuracyPct < 100 && (
                  <div className="space-y-1.5 pt-1">
                    {LEVEL0_CONCEPTS.filter((def) => choiceDistribution[def.id]).map((def) => {
                      const count = choiceDistribution[def.id] || 0;
                      const pct = Math.round((count / totalSubmissions) * 100);
                      const isCorrect = def.id === concept.id;

                      return (
                        <div
                          key={def.id}
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                            isCorrect ? 'text-emerald-300 font-bold' : 'text-slate-400 bg-slate-950/50'
                          }`}
                        >
                          <span className="truncate max-w-[80%]">{def.definition}</span>
                          <span>
                            {pct}% ({count})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
